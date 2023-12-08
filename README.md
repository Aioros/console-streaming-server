# Console Streaming Server

Console Streaming Server is a simple server that hijacks your console's broadcast to Twitch and publishes it in your network, allowing you to process it with OBS or any other streaming tool before sending it to your favorite streaming platform.

## Who would need this?

Anybody who:

1. likes to stream directly from their console without a capture card, but is not happy with the lack of features, overlays, and general customization, and
2. has a computer somewhere in their network that could be used to host and/or restream.

They can keep the simplicity of just starting the stream from their console with video and audio already set up, and add the possibility of adding all the bells and whistles that PC streamers have. Or even just use a regular webcam instead of the weird PlayStation one, I know that's why *I* started doing this.

## How does it work?

Console Streaming Server is made of two core parts, a DNS server and a RTMP server. **The main thing that you need to do is change your console's Primary DNS** to the IP address of the device running this application. At that point, when the console tries to stream to Twitch, the DNS part will "trick" it into sending the stream to the RTMP part. The stream is then hosted on your network, and you are free to add it as a Media Scene in OBS, restream it, or do whatever you want with it.

## Isn't this what LightStream and Streamlabs do?

Pretty much, yes. Using a professional cloud service has the advantage of not requiring a PC on your part, but you also have less flexibility and less control over your stream. Having it in-network allows you to use your favorite streaming software, send it to whatever platform you want, or even just stream for clients in your home directly from your console. Also, it's free.

## FAQ

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

Yeah, I know, not the most Frequently Asked Question. I am not knowledgeable enough to know exactly how to package a generic release for Linux or macOS. What I do know, is that the build chain should work, for both, since I am able to build the project on macOS Monterey and on Ubuntu 22.04. You should be able to do the same by running `npm install` and `npm run build`. The project uses Qt 6, so your mileage may vary on the libraries that you might need to install. For me, on Ubuntu, it was `libgl1-mesa-glx`, `libopeng10`, `libegl1`.

But also, if building it is too much of a headache, you can still run the application normally in Node. You probably know the drill: make sure you installed Node.js on your system, clone the repository, `npm install`, `npm start`, and you should be up and running.

# License

This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
