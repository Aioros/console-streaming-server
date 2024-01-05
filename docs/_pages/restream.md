---
layout: splash
permalink: /restream/
title: "Restream"
---

Once your server is setup and it's receiving a broadcast, you decide what to do with it. By far, the most common usage would be to bring it into your favorite streaming software suite, customize it, and restream to whichever service you prefer.

What you are hosting on your computer at this point is an RTMP stream. Most streaming software should be able to import it into a scene without issues. Here's how to do just that in [OBS](https://obsproject.com/):

1. Create a new scene, or select an existing one you would like to add the stream to;
2. In the *Sources* pane, add a *Media Source*;
3. In the properties for the new source, choose:
- *Local File*: Off
- *Input*: the stream's URL: you can copy and paste it from the server's main tab (it will be something like `rtmp://<youripaddress>/app/<yourstreamkey>`)
- *Input Format*: rtmp

Congrats, your console stream is now in OBS and you can customize your scenes just like those fancy PC streamers! You have access to overlays, transitions, additional sources, and everything else, and you can then stream to your channels anywhere.