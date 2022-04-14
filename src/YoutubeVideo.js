import YouTube from "react-youtube";

const YoutubeVideo = ({videoId}) => {

    const opts = {
        height: '390',
        width: '640',
        playerVars: {
            origin: window.location.href,
            enablejsapi: 1
        }
    };

    const onReady = e => {
        e.target.pauseVideo();
    }

    return (
        <YouTube className="youtube-video" videoId={videoId} opts={opts} onReady={onReady}/>
    )

}

export default YoutubeVideo;
