const path = require("path");
// Fix for my assets folder, this way I can just copy it in ./dist before packing
process.chdir("./dist");
// Now start loading the actual bundle
require("./dist");