# Console Streaming Server

[Console Streaming Server](https://consolestreamingserver.net) is a simple server that hijacks your console's broadcast to Twitch and publishes it in your network, allowing you to process it with OBS or any other streaming tool before sending it to your favorite streaming platform.

## Who would need this?

Anybody who:

1. likes to stream directly from their console without a capture card, but is not happy with the lack of features, overlays, and general customization, and
2. has a computer somewhere in their network that could be used to host and/or restream.

They can keep the simplicity of just starting the stream from their console with video and audio already set up, and add the possibility of adding all the bells and whistles that PC streamers have. Or even just use a regular webcam instead of the weird PlayStation one, I know that's why *I* started doing this.

## How does it work?

Console Streaming Server is made of two core parts, a DNS server and a RTMP server. **The main thing that you need to do is change your console's Primary DNS** to the IP address of the device running this application. At that point, when the console tries to stream to Twitch, the DNS part will "trick" it into sending the stream to the RTMP part. The stream is then hosted on your network, and you are free to add it as a Media Scene in OBS, restream it, or do whatever you want with it.

So you can just grab the [latest release](https://github.com/Aioros/console-streaming-server/releases/latest), extract the zip file wherever you prefer on your computer, run it and start the server. Once you set up the console's DNS, you can just start streaming to Twitch as usual, except that instead it will go to your new server. You will see the active stream URL listed in the application home page. If you want to add it as a source to an OBS scene (I imagine that's the most likely use case), you just need to add a Media Source with:
- Local File: Off
- Input: the stream link from the server's home page (it will be something like `rtmp://<youripaddress>/app/<yourstreamkey>`)
- Input Format: rtmp

## Isn't this what LightStream and Streamlabs do?

Pretty much, yes. Using a professional cloud service has the advantage of not requiring a PC on your part, but you also have less flexibility and less control over your stream. Having it in-network allows you to use your favorite streaming software, send it to whatever platform you want, or even just stream for clients in your home directly from your console. Also, it's free.

## FAQ

### What about any service other than Twitch?

At the moment, Twitch is the only supported service *on the console's end*. This doesn't mean that you can only send the stream to Twitch, though! It just means that in order to capture the stream, you need to start broadcasting to Twitch from the console. What you do with it after is entirely up to you.

### Does this automatically restream to my favorite platform?

No, Console Streaming Server only receives the stream from the console and hosts it on your device. To actually send it to Twitch or any other service you would need your own application, like [OBS](https://obsproject.com/) or similar.

### I changed my Primary DNS as instructed and now my console can't connect to anything!

You should choose a valid Secondary DNS too. If you don't, your console will not be able to reach anything when Console Streaming Server is off. Recommended choices for Secondary DNS are:

- the original Primary DNS
- your default gateway (commonly your router's IP address, like 192.168.1.1)
- Google DNS (8.8.8.8) or Cloudflare DNS (1.1.1.1)

### It was working fine but something changed and it's not working anymore!

There's two main situations where the setup breaks a little bit:

 1. Your computer's IP changed. Maybe because that just happens in your home network, maybe because you switched from Ethernet to Wi-Fi or vice versa. In this case, you will need to update the Primary DNS in your console again to the new address, and also update the IP address that you see in Console Streaming Server's `Advanced` page (I'm currently working on detecting such a change and automatically fix that part at least).
 2. You were streaming to Twitch normally before turning on Console Streaming Server. And now it keeps going directly to Twitch even if the server is on. This is because the console caches some DNS info. The quickest way to fix it is to restart your console while keeping the server on.

In general, it's recommended to have Console Streaming Server up and active before trying to broadcast anything, or even before turning the console on entirely, but if the DNS is set correctly to your computer's IP, I promise a console restart will fix everything.

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

# License

This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
