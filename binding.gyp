{
  "targets": [
    {
      "target_name": "engine",
      "sources": [ "src/cpp/test.cpp" ],
      "libraries": [
        "<(module_root_dir)/v8/v8-v142-x64.8.4.371.15/lib/Release/v8_libbase.dll.lib",
        "<(module_root_dir)/v8/v8-v142-x64.8.4.371.15/lib/Release/v8_libplatform.dll.lib",
        "<(module_root_dir)/v8/v8-v142-x64.8.4.371.15/lib/Release/v8_libplatform.dll.lib",
        "<(module_root_dir)/v8/v8-v142-x64.8.4.371.15/lib/Release/v8.dll.lib",
        "<(module_root_dir)/v8/v8-v142-x64.8.4.371.15/lib/Release/zlib.dll.lib"
      ],
      'conditions': [
        ['OS=="win"', {
          "msvs_settings": {
            "VCCLCompilerTool": {
              "ExceptionHandling": 1
            }
          },
          'copies': [{
            'destination': 'build/release',
            'files': [
              'v8/v8.redist-v142-x64.8.4.371.15/lib/Release/icui18n.dll',
              'v8/v8.redist-v142-x64.8.4.371.15/lib/Release/icuuc.dll',
              'v8/v8.redist-v142-x64.8.4.371.15/lib/Release/v8_libbase.dll',
              'v8/v8.redist-v142-x64.8.4.371.15/lib/Release/v8_libplatform.dll',
              'v8/v8.redist-v142-x64.8.4.371.15/lib/Release/v8.dll',
              'v8/v8.redist-v142-x64.8.4.371.15/lib/Release/zlib.dll'
            ]
          }]
        }]
      ]
    }
  ]
}


# {
#   "targets": [{
#       "target_name": "engine",
#       "cflags!": [ "-fno-exceptions" ],
#       "cflags_cc!": [ "-fno-exceptions" ],
#       "sources": [
#           "src/cpp/test.cpp",
#       ],
#       "include_dirs": [
#         "<!(node -e \"require('nan')\")"
#       ],
#       'include_dirs': [
#           "<!@(node -p \"require('node-addon-api').include\")",
#           "v8/v8-v142-x64.8.4.371.15/include"
#       ],
#       "libraries": [
#         "<(module_root_dir)/v8/v8-v142-x64.8.4.371.15/lib/Release/v8_libbase.dll.lib",
#         "<(module_root_dir)/v8/v8-v142-x64.8.4.371.15/lib/Release/v8_libplatform.dll.lib",
#         "<(module_root_dir)/v8/v8-v142-x64.8.4.371.15/lib/Release/v8_libplatform.dll.lib",
#         "<(module_root_dir)/v8/v8-v142-x64.8.4.371.15/lib/Release/v8.dll.lib",
#         "<(module_root_dir)/v8/v8-v142-x64.8.4.371.15/lib/Release/zlib.dll.lib"
#       ],
#       'dependencies': [
#           "<!(node -p \"require('node-addon-api').gyp\")"
#       ],
#       'defines': [ 'NAPI_DISABLE_CPP_EXCEPTIONS' ],
#       'conditions': [
#       ['OS=="win"', {
#         "msvs_settings": {
#           "VCCLCompilerTool": {
#             "ExceptionHandling": 1
#           }
#         }
#         ,
#         'copies': [{
#           'destination': 'build/release',
#           'files': [
#             'v8/v8.redist-v142-x64.8.4.371.15/lib/Release/icui18n.dll',
#             'v8/v8.redist-v142-x64.8.4.371.15/lib/Release/icuuc.dll',
#             'v8/v8.redist-v142-x64.8.4.371.15/lib/Release/v8_libbase.dll',
#             'v8/v8.redist-v142-x64.8.4.371.15/lib/Release/v8_libplatform.dll',
#             'v8/v8.redist-v142-x64.8.4.371.15/lib/Release/v8.dll',
#             'v8/v8.redist-v142-x64.8.4.371.15/lib/Release/zlib.dll'
#           ]
#         }]
#       }],
#       ['OS=="mac"', {
#         "xcode_settings": {
#           "CLANG_CXX_LIBRARY": "libc++",
#           'GCC_ENABLE_CPP_EXCEPTIONS': 'YES',
#           'MACOSX_DEPLOYMENT_TARGET': '10.7'
#         }
#       }]
#     ]
#   }]
# }