#include <node.h>

#include <napi.h>

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <iostream>
#include <sstream>

using v8::Context;
using v8::EscapableHandleScope;
using v8::External;
using v8::Function;
using v8::FunctionTemplate;
using v8::Global;
using v8::HandleScope;
using v8::Isolate;
using v8::Local;
using v8::MaybeLocal;
using v8::Name;
using v8::NamedPropertyHandlerConfiguration;
using v8::NewStringType;
using v8::Object;
using v8::ObjectTemplate;
using v8::PropertyCallbackInfo;
using v8::Script;
using v8::String;
using v8::TryCatch;
using v8::Value;
using v8::FunctionCallbackInfo;
using std::string;
using std::to_string;

// Extracts a C string from a V8 Utf8Value.
const char* ToCString(const v8::String::Utf8Value& value) {
  return *value ? *value : "<string conversion failed>";
}

static void LogCallback(const v8::FunctionCallbackInfo<v8::Value>& args) {
  if (args.Length() < 1) return;
  Isolate* isolate = args.GetIsolate();
  HandleScope scope(isolate);
  Local<Value> arg = args[0];
  String::Utf8Value value(isolate, arg);
  printf("log: %s\n", *value);
}

string ReportException(v8::Isolate* isolate, v8::TryCatch* try_catch) {
  v8::HandleScope handle_scope(isolate);
  v8::String::Utf8Value exception(isolate, try_catch->Exception());
  string exception_str = string(ToCString(exception));
  v8::Local<v8::Message> message = try_catch->Message();
  if (message.IsEmpty()) {
    return exception_str;
  } else {
    v8::String::Utf8Value filename(isolate, message->GetScriptOrigin().ResourceName());
    v8::Local<v8::Context> context(isolate->GetCurrentContext());
    string filename_str = string(*filename);
    string linenum_str = to_string(message->GetLineNumber(context).FromJust());
    std::stringstream response; response << filename_str << ":"
      << linenum_str << ": " << exception_str << "\n";
    v8::String::Utf8Value sourceline(isolate, message->GetSourceLine(context)
      .ToLocalChecked());
    const char* sourceline_string = ToCString(sourceline);
    fprintf(stderr, "%s\n", sourceline_string);
    response << string(sourceline_string) << "\n";
    int start = message->GetStartColumn(context).FromJust();
    for (int i = 0; i < start; i++) response << " ";
    int end = message->GetEndColumn(context).FromJust();
    for (int i = start; i < end; i++) response << "^";
    response << "\n";
    v8::Local<v8::Value> stack_trace_string;
    if (try_catch->StackTrace(context).ToLocal(&stack_trace_string) 
      && stack_trace_string->IsString() 
      && stack_trace_string.As<v8::String>()->Length() > 0) {
      v8::String::Utf8Value stack_trace(isolate, stack_trace_string);
      const char* stack_trace_string = ToCString(stack_trace);
      response << string(stack_trace_string) << "\n";
    }
    return response.str();
  }
}

string executeScript(Isolate* isolate, Local<String> script) {
  TryCatch try_catch(isolate);

  Local<ObjectTemplate> global = ObjectTemplate::New(isolate);
  global->Set(isolate, "log",
              FunctionTemplate::New(isolate, LogCallback));

  Local<Context> context = Context::New(isolate, NULL, global);
  // Compile the script and check for errors.
  Local<Script> compiled_script;
  if (!Script::Compile(context, script).ToLocal(&compiled_script)) {
    return ReportException(isolate, &try_catch);
  }
  printf("test\n");
  // Run the script!
  v8::Local<v8::Value> result;
  if (!compiled_script->Run(context).ToLocal(&result)) {
    return ReportException(isolate, &try_catch);
  }
  v8::String::Utf8Value res(v8::Isolate::GetCurrent(), result);
  return string(*res);
}

void execute(const FunctionCallbackInfo<Value>& args){
  Isolate* isolate = args.GetIsolate();
  // Create a new context.
  Local<Context> context = Context::New(isolate);
  // Enter the context for compiling and running the hello world script.
  Context::Scope context_scope(context);
  Local<String> fileName = args[0].As<String>(); 
  string result = executeScript(isolate, fileName);
  args.GetReturnValue().Set(String::NewFromUtf8(isolate, result.c_str()).ToLocalChecked());
}

void Initialize(Local<Object> exports) {
  NODE_SET_METHOD(exports, "execute", execute);
}

NODE_MODULE(NODE_GYP_MODULE_NAME, Initialize)

