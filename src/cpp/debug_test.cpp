// hello.cc
#include <node.h>
// #include <v8.h>
// #include <libplatform/libplatform.h>

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

// Extracts a C string from a V8 Utf8Value.
const char* ToCString(const v8::String::Utf8Value& value) {
  return *value ? *value : "<string conversion failed>";
}

void ReportException(v8::Isolate* isolate, v8::TryCatch* try_catch) {
  v8::HandleScope handle_scope(isolate);
  v8::String::Utf8Value exception(isolate, try_catch->Exception());
  const char* exception_string = ToCString(exception);
  v8::Local<v8::Message> message = try_catch->Message();
  if (message.IsEmpty()) {
    // V8 didn't provide any extra information about this error; just
    // print the exception.
    fprintf(stderr, "%s\n", exception_string);
  } else {
    // Print (filename):(line number): (message).
    v8::String::Utf8Value filename(isolate,
                                   message->GetScriptOrigin().ResourceName());
    v8::Local<v8::Context> context(isolate->GetCurrentContext());
    const char* filename_string = ToCString(filename);
    int linenum = message->GetLineNumber(context).FromJust();
    fprintf(stderr, "%s:%i: %s\n", filename_string, linenum, exception_string);
    // Print line of source code.
    v8::String::Utf8Value sourceline(
        isolate, message->GetSourceLine(context).ToLocalChecked());
    const char* sourceline_string = ToCString(sourceline);
    fprintf(stderr, "%s\n", sourceline_string);
    // Print wavy underline (GetUnderline is deprecated).
    int start = message->GetStartColumn(context).FromJust();
    for (int i = 0; i < start; i++) {
      fprintf(stderr, " ");
    }
    int end = message->GetEndColumn(context).FromJust();
    for (int i = start; i < end; i++) {
      fprintf(stderr, "^");
    }
    fprintf(stderr, "\n");
    v8::Local<v8::Value> stack_trace_string;
    if (try_catch->StackTrace(context).ToLocal(&stack_trace_string) &&
        stack_trace_string->IsString() &&
        stack_trace_string.As<v8::String>()->Length() > 0) {
      v8::String::Utf8Value stack_trace(isolate, stack_trace_string);
      const char* stack_trace_string = ToCString(stack_trace);
      fprintf(stderr, "%s\n", stack_trace_string);
    }
  }
}

// String::Utf8Value executeScript(Isolate* isolate, Local<String> script) {
//   TryCatch try_catch(isolate);
//   Local<Context> context = Context::New(isolate);
//   Local<Script> compiled_script;
//   Local<Value> result;
//   if (!Script::Compile(context, script).ToLocal(&compiled_script)) {
//     ReportException(isolate, &try_catch);
//     String::Utf8Value utf8 (isolate, result);
//     return "";
//   }
//   if (!compiled_script->Run(context).ToLocal(&result)) {
//     ReportException(isolate, &try_catch);
//     String::Utf8Value utf8 (isolate, result);
//     return "";
//   }
  
//   String::Utf8Value utf8 (isolate, result);

//   return utf8;
// }

//String::Utf8Value result = executeScript(isolate, fileName);

// static void DebugSetBreakpointHandler(const v8::Debug::Message& message) {
//   v8::Local<v8::String> json = message.GetJSON();
//   v8::String::Utf8Value utf8(json);

//   SetBreakpointResult(*utf8);
// }

void execute(const FunctionCallbackInfo<Value>& args){
  // Get VM isolate.
  Isolate* isolate = args.GetIsolate();

//  Local<String> handle_user_req =
//         String::NewFromUtf8(isolate,
//                 "DebugUserRequest", NewStringType::kNormal)
//         .ToLocalChecked();
//     Local<Value> handle_user_req_val;
//     if(!context->Global()->Get(context,
//                 handle_user_req).ToLocal(&handle_user_req_val))
//         cout << "Failed to grab DebugUserRequest function " << endl;

    SetBreakpoint();



  // Access context from VM isolate.
  Local<Context> context = Context::New(isolate);
  // Enter the context for compiling and running the script.
  Context::Scope context_scope(context);
  // Parse script argument.
  Local<String> fileName = args[0].As<String>(); 
  // Compile the source code.
  Local<Script> script = Script::Compile(context, fileName).ToLocalChecked();
  // Run the script to get the result.
  Local<Value> result = script->Run(context).ToLocalChecked();
  // Convert the result to an UTF8 string and print it.
  String::Utf8Value utf8 (isolate, result);
  // Set return value to result of script.
  args.GetReturnValue().Set(String::NewFromUtf8(isolate, ToCString(utf8)).ToLocalChecked());
}

void execute1(const FunctionCallbackInfo<Value>& args) {
  Isolate* isolate = args.GetIsolate();
  args.GetReturnValue().Set(String::NewFromUtf8(
      isolate, "world").ToLocalChecked());
}

void Initialize(Local<Object> exports) {
  NODE_SET_METHOD(exports, "execute", execute);
}

NODE_MODULE(NODE_GYP_MODULE_NAME, Initialize)

