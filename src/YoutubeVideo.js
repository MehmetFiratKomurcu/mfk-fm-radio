import YouTube from "react-youtube";

const YoutubeVideo = () => {

    const opts = {
        height: '390',
        width: '640',
        playerVars: {
            // https://developers.google.com/youtube/player_parameters
            autoplay: 1,
        },
    };

    const onReady = e => {
        e.target.pauseVideo();
    }

    return (
        <YouTube videoId="" opts={opts} onReady={onReady}/>
    )

}

export default YoutubeVideo;
