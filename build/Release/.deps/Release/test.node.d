cmd_Release/test.node := ln -f "Release/obj.target/test.node" "Release/test.node" 2>/dev/null || (rm -rf "Release/test.node" && cp -af "Release/obj.target/test.node" "Release/test.node")
