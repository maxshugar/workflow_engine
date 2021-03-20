/*
 *  Example program using the dvalue debug transport.
 */

#include <stdio.h>
#include <stdlib.h>

#include "duktape.h"

static duk_ret_t native_print(duk_context *ctx) {
	duk_push_string(ctx, " ");
	duk_insert(ctx, 0);
	duk_join(ctx, duk_get_top(ctx) - 1);
	printf("%s\n", duk_to_string(ctx, -1));
	return 0;
}

int main(int argc, char *argv[]) {

    duk_context* ctx = duk_create_heap_default();

    printf("attaching debugger to ctx.\n");

    duk_push_c_function(ctx, native_print, DUK_VARARGS);
    duk_put_global_string(ctx, "print");

	duk_debugger_attach(ctx,
		NULL,
		NULL,
		NULL,
		NULL,
		NULL,
		NULL,
		NULL,
		NULL);

	/* Evaluate simple test code, callbacks will "step over" until end.
	 *
	 * The test code here is just for exercising the debug transport.
	 * The 'evalMe' variable is evaluated (using debugger command Eval)
	 * before every step to force different dvalues to be carried over
	 * the transport.
	 */

	duk_eval_string(ctx,
		"var evalMe;\n"
		"\n"
		"print('Hello world!');\n"
		"[ undefined, null, true, false, 123, -123, 123.1, 0, -0, 1/0, 0/0, -1/0, \n"
		"  'foo', Uint8Array.allocPlain('bar'), Duktape.Pointer('dummy'), Math.cos, \n"
		"].forEach(function (val) {\n"
		"    print(val);\n"
		"    evalMe = val;\n"
		"});\n"
		"\n"
		"var str = 'xxx'\n"
		"for (i = 0; i < 10; i++) {\n"
		"    print(i, str);\n"
		"    evalMe = str;\n"
		"    evalMe = Uint8Array.allocPlain(str);\n"
		"    str = str + str;\n"
		"}\n"
	);
	duk_pop(ctx);

	duk_debugger_detach(ctx);


	return 0;
}
