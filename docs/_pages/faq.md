---
layout: splash
permalink: /faq/
title: "Frequently Asked Questions"
---

### What about any service other than Twitch?

At the moment, Twitch is the only supported service *on the console's end*. This doesn't mean that you can only send the stream to Twitch, though! It just means that in order to capture the stream, you need to start broadcasting to Twitch from the console. What you do with it after is entirely up to you.

### Does this automatically restream to my favorite platform?

No, Console Media Server only receives the stream from the console and hosts it on your device. To actually send it to Twitch or any other service you would need your own application, like [OBS](https://obsproject.com/) or similar.

### I changed my Primary DNS as instructed and now my console can't connect to anything!

You should choose a valid Secondary DNS too. If you don't, your console will not be able to reach anything when Console Media Server is off. Recommended choices for Secondary DNS are:

- the original Primary DNS
- your default gateway (commonly your router's IP address, like 192.168.1.1)
- Google DNS (8.8.8.8) or Cloudflare DNS (1.1.1.1)

### Do I have to use both the DNS server and the RTMP server on the same machine?

No, you can pick and choose the parts that you need. In the Advanced tab, you can select a mode between Standard, DNS Server Only, and RTMP Server Only.

For example, you might already have your own configurable DNS server, or you might already have your own RTMP server. You can run just the missing piece and configure it to interact with your existing servers. Or you could run DNS Server Only on one device and RTMP Server Only on another.

### How do I use this on Linux/macOS?

Yeah, I know, not the most Frequently Asked Question. I do not have packages ready for Linux distributions or macOS yet, but the build chain should work for both, since I am able to build the project on macOS Monterey and on Ubuntu 22.04. You should be able to do the same by running `npm install` and `npm run build`. The project uses Qt 6, so your mileage may vary on the libraries that you might need to install. For me, on Ubuntu 22.04, it was:
- `fuse` (if not already installed) and `libfuse2` (these are only needed for the build process, not necessary to run the app)
- `libgl1-mesa-glx`
- `libopengl0`
- `libegl1`

But also, if building it is too much of a headache, you can still run the application normally in Node.js. You probably know the drill: make sure you installed Node.js on your system, clone the repository, `npm install`, `npm start`, and you should be up and running.
