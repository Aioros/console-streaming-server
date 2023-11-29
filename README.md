# Console Streaming Server

Console Streaming Server is a simple server that hijacks your console's broadcast to Twitch and publishes it in your network, allowing you to process it with OBS or any other streaming tool before sending it to your favorite streaming platform.

## Who would need this?

Anybody who: 

 1. likes to stream directly from their console without a capture card, but is not happy with the lack of features, overlays, and general customization, and
 2. has a computer somewhere in their network that could be used to restream.

They can keep the simplicity of just starting the stream from their console with video and audio already set up, and add the possibility of adding all the bells and whistles that PC streamers have. Or even just use a regular webcam instead of the weird PlayStation one, I know that's why *I* started doing this.

## How does it work?

Console Streaming Server is made of two core parts, a DNS server and a RTMP server. **The main thing that you need to do is change your console's Primary DNS** to the IP address of the device running this application. At that point, when the console tries to stream to Twitch, the DNS part will "trick" it into sending the stream to the RTMP part. The stream is then hosted on your network, and you are free to add it as a Media Scene in OBS, restream it, or do whatever you want with it.

## Isn't this what LightStream and Streamlabs do?

Pretty much, yes. Using a professional cloud service has the advantage of not requiring a PC on your part, but you also have less control over the stream. Having it in-network allows you to use your favorite streaming software, send it to whatever platform you want, or even just streaming for clients in your home directly from your console. Also, it's free.

## FAQ

### What about any service other than Twitch?
At the moment, Twitch is the only supported service *on the console's end*. This doesn't mean that you can only send the stream to Twitch, though! It just means that in order to capture the stream, you need to start broadcasting to Twitch from the console. What you do with it after is entirely up to you.
### Does this automatically restream to my favorite platform?
No, Console Media Server only receives the stream from the console and hosts it on your device. To actually send it to Twitch or any other service you would need your own application, like [OBS](https://obsproject.com/) or similar.
### Do I have to use both the DNS server and the RTMP server on the same machine?
No, you can pick and choose the parts that you need. In the Advanced tab, you can select a mode between Standard, DNS Server Only, and RTMP Server Only.
For example, you might already have your own configurable DNS server, or you might already have your own RTMP server. You can run just the missing piece and configure it to interact with your existing servers. Or you could run DNS Server Only on one device and RTMP Server Only on another.

# License
Console Media Server is published under the MIT license. You can find the boring details inside, but you can basically do whatever you want with it.