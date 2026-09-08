self.__BUILD_MANIFEST = {
  "__rewrites": {
    "afterFiles": [
      {
        "source": "/wbos/:slug/:path*",
        "destination": "/wbos/sadaat/:path*"
      },
      {
        "source": "/wbos/:slug",
        "destination": "/wbos/sadaat"
      }
    ],
    "beforeFiles": [],
    "fallback": []
  },
  "sortedPages": [
    "/_app",
    "/_error"
  ]
};self.__BUILD_MANIFEST_CB && self.__BUILD_MANIFEST_CB()