#include <node.h>
#include <napi.h>
#include <v8.h>

#include <chrono>
#include <thread>
#include <iostream>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

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

 Napi::String dataString;
Napi::Function emit;

const char* ToCString(const v8::String::Utf8Value& value) {
  return *value ? *value : "<string conversion failed>";
}

static void LogCallback(const v8::FunctionCallbackInfo<v8::Value>& args) {
  if (args.Length() < 1) return;
  Isolate* isolate = args.GetIsolate();
  HandleScope scope(isolate);
  Local<Value> arg = args[0];
  String::Utf8Value value(isolate, arg);

  std::initializer_list<napi_value>& val {dataString};

  //emit.Call();

  printf("log: %s\n", *value);
}

string ReportException(v8::Isolate* isolate, v8::TryCatch* try_catch) {
    v8::HandleScope handle_scope(isolate);
    v8::String::Utf8Value exception(isolate, try_catch->Exception());
    string exception_str = string(ToCString(exception));
    v8::Local<v8::Message> message = try_catch->Message();
    if (message.IsEmpty()) 
        return exception_str;
    v8::String::Utf8Value filename(isolate,
                                   message->GetScriptOrigin().ResourceName());
    v8::Local<v8::Context> context(isolate->GetCurrentContext());
    string filename_str = string(*filename);
    string linenum_str = to_string(message->GetLineNumber(context).FromJust());
    string response = filename_str + ":" + linenum_str + ": " + exception_str + "\n";
    // Print line of source code.
    v8::String::Utf8Value sourceline(
        isolate, message->GetSourceLine(context).ToLocalChecked());
    const char* sourceline_string = ToCString(sourceline);
    fprintf(stderr, "%s\n", sourceline_string);
    response.append(sourceline_string);
    response.append("\n");
    // Print wavy underline (GetUnderline is deprecated).
    int start = message->GetStartColumn(context).FromJust();
    for (int i = 0; i < start; i++) {
      response.append(" ");
    }
    int end = message->GetEndColumn(context).FromJust();
    for (int i = start; i < end; i++) {
      response.append("^");
    }
    response.append("\n");
    v8::Local<v8::Value> stack_trace_string;
    if (try_catch->StackTrace(context).ToLocal(&stack_trace_string) &&
        stack_trace_string->IsString() &&
        stack_trace_string.As<v8::String>()->Length() > 0) {
      v8::String::Utf8Value stack_trace(isolate, stack_trace_string);
      const char* stack_trace_string = ToCString(stack_trace);
      response.append(stack_trace_string);
      response.append("\n");
    }
    return response;
}

string executeScript(Isolate* isolate, string _script) {
  TryCatch try_catch(isolate);
  Local<String> script = (String::NewFromUtf8(isolate, _script.c_str())).ToLocalChecked();
  Local<ObjectTemplate> global = ObjectTemplate::New(isolate);

  Local<FunctionTemplate> ft = FunctionTemplate::New(isolate, LogCallback);
  global->Set(isolate, "log", ft);
  Local<Context> context = Context::New(isolate, NULL, global);
  Local<Script> compiled_script;
  if (!Script::Compile(context, script).ToLocal(&compiled_script)) 
    return ReportException(isolate, &try_catch);
  v8::Local<v8::Value> result;
  if (!compiled_script->Run(context).ToLocal(&result)) 
    return ReportException(isolate, &try_catch);
  v8::String::Utf8Value res(v8::Isolate::GetCurrent(), result);
  return string(*res);
}


Napi::Value execute(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    emit = info[0].As<Napi::Function>();
    Napi::String script = info[1].As<Napi::String>();

    Isolate* isolate = Isolate::GetCurrent();
    executeScript(isolate, script.Utf8Value());
    
    dataString = Napi::String::New(env, "data");

    //Napi::Value val = env.RunScript(script);

    // emit.Call({Napi::String::New(env, "start")});
    // for(int i = 0; i < 3; i++) {
    //     std::this_thread::sleep_for(std::chrono::seconds(3));
        // emit.Call({Napi::String::New(env, "data"),
        //     val});
    // }
    emit.Call({Napi::String::New(env, "end")});
    return Napi::String::New(env, "OK");
}

// Init
Napi::Object Init(Napi::Env env, Napi::Object exports) {
    exports.Set(Napi::String::New(env, "execute"),
        Napi::Function::New(env, execute));
    return exports;
}

NODE_API_MODULE(NODE_GYP_MODULE_NAME, Init);