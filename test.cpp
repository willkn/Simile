#include <node_api.h>

napi_value HelloMethod(napi_env env, napi_callback_info info) {
  napi_value greeting;
  napi_create_string_utf8(env, "Hello, from C++!", NAPI_AUTO_LENGTH, &greeting);
  return greeting;
}

napi_value Init(napi_env env, napi_value exports) {
  napi_property_descriptor desc = {"hello", 0, HelloMethod, 0, 0, 0, napi_default, 0};
  napi_define_properties(env, exports, 1, &desc);
  return exports;
}

NAPI_MODULE(NODE_GYP_MODULE_NAME, Init)