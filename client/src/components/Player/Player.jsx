import ReactPlayer from 'react-player';

// play video from a file

const Player = () => {
    return (
        <ReactPlayer
            url='http://localhost:8000/video/?fileName=backgroundfinal'
            controls={true}
            width='60%'
            height='60%'

            autoPlay={true}
        />
    );
}
export default Player;