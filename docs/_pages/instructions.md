---
layout: splash
permalink: /instructions/
title: "Instructions"
#layouts_gallery:
#  - url: /assets/images/mm-layout-splash.png
#    image_path: /assets/images/mm-layout-splash.png
#    alt: "splash layout example"
#  - url: /assets/images/mm-layout-single-meta.png
#    image_path: /assets/images/mm-layout-single-meta.png
#    alt: "single layout with comments and related posts"
#  - url: /assets/images/mm-layout-archive.png
#    image_path: /assets/images/mm-layout-archive.png
#    alt: "archive layout example"
#toc: true
---

Console Streaming Server is a simple server that hijacks your console's broadcast to Twitch and publishes it in your network, allowing you to process it with OBS or any other streaming tool before sending it to your favorite streaming platform.

## Setup

The first step is [downloading](https://github.com/Aioros/console-streaming-server/releases/latest/download/ConsoleStreamingServer.zip) Console Streaming Server on your computer. On Windows, you can get a simple archive file and unzip it anywhere. Pre-built releases on Linux and macOS are not available yet, but [building the project]({{ "/support/#non-windows-platforms-and-building-from-source" | relative_url }}) should not be difficult if you have some tech skills.
Once it's up and running, you can just click the big *Start* button, and the server will be ready to receive broadcasts.

The second step is **changing your console's DNS settings**. This is necessary to trick your console into sending the stream to your computer instead of Twitch. Set the **Primary DNS** to the IP address of the computer running the server (if you don't know it, you can find it in the *Instructions* tab in the application itself). You should also have an actual Secondary DNS setting too, otherwise your console will have connection problems anytime the server is off: you could use the original Primary DNS, or something like Google DNS (8.8.8.8) or Cloudflare DNS (1.1.1.1).
You can find detailed instructions on how to modify your console's DNS settings [here](https://nordvpn.com/blog/how-to-change-dns-on-game-consoles/).

And then you are all set. When you start a Twitch stream on your console with the server on, the broadcast will actually be sent to your computer. You should be able to see active streams with their URL listed in the main tab of the application.