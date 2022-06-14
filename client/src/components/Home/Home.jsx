import React, { useState, useRef } from 'react'
import { useEffect } from 'react';
import { getPost } from '../../api/reddit/subreddit';
import { convertVideo } from '../../api/video';
import { storeImage } from '../../api/image';
import { getTextToSpeech } from '../../api/TTS';
import { toPng } from 'html-to-image';
import moment from 'moment';
import './Home.css'
import Player from '../Player/Player';
const Home = () => {
    const [posts, setPosts] = useState();
    const [loading, setLoading] = useState(false);
    const [loaderComments, setLoaderComments] = useState(false);
    const [comments, setComments] = useState();
    const [error, setError] = useState(null);
    const [showComments, setShowComments] = useState(false);
    const [numComments, setNumComments] = useState(5);
    const [commentIndex, setCommentIndex] = useState([]);
    const [selectOptionGames, setSelectOptionGames] = useState('https://www.youtube.com/watch?v=fWVjA0Hirlo');
    const [selectOptionDuration, setSelectOptionDuration] = useState(30);
    const [responseMessage, setResponseMessage] = useState('');
    const [responseStatus, setResponseStatus] = useState(null);
    const [btnloading, setBtnloading] = useState(false);
    const [showPlayer, setShowPlayer] = useState(false);
    const [showPlayBtn, setShowPlayBtn] = useState(false);
    const [toPngImages, setToPngImages] = useState([]);
    //refs
    let domGlobal;
    const domRef1 = useRef(null);
    const domRef2 = useRef(null);
    const domRef3 = useRef(null);
    const domRef4 = useRef(null);
    const domRef5 = useRef(null);


    let imagesIndex = [];
    let imagesComment = [];


    const options = {
        limit: 10,
        sort: 'top',
        type: 'random',
        subreddit: 'askreddit'
    }
    const games = [
        { title: 'Minecraft', url: 'https://www.youtube.com/watch?v=fWVjA0Hirlo' },
        { title: 'BeamNG Drive', url: 'https://www.youtube.com/watch?v=ln1LmcqHiYk' },
        { title: 'GTA V', url: 'https://www.youtube.com/watch?v=xEBh2RRJx7A' },
    ]
    const handlePost = async () => {
        setLoading(true);
        setResponseMessage('');
        setLoaderComments(true);
        setShowComments(false);
        setShowPlayer(false);
        setError(null);
        setCommentIndex([]);
        //check if the user is connected to the internet
        try {
            const data = await getPost(options);
            setPosts(data[0].data.children[0].data);
            setComments(data[1].data.children.slice(0, numComments));
            setLoading(false);
        } catch (error) {
            setError('Something went wrong : ' + error.message);
            setLoading(false);
            setComments(null);
            setPosts(null);
        }
    }



    const handleComments = async () => {
        setShowComments(!showComments);
        setLoaderComments(false)
    }

    const handleSelectComment = (e) => {
        const Id = e.currentTarget.getAttribute("data-key");
        const index = e.currentTarget.getAttribute("data-index");
        domGlobal = index === '0' ? domRef1 : index === '1' ? domRef2 : index === '2' ? domRef3 : index === '3' ? domRef4 : domRef5;
        if (commentIndex.includes(Id)) {
            setCommentIndex(commentIndex.filter(item => item !== Id));
            imagesComment = imagesComment.filter(item => item.index !== index);
            imagesIndex = imagesIndex.filter(item => item.index !== index);
            setToPngImages(toPngImages.filter(item => item.index !== index));
        }
        else {
            if (commentIndex.length < 3) {
                setCommentIndex([...commentIndex, Id]);
                setToPngImages([...toPngImages, { domGlobal, index }])
            }
        }
    }


    //onchange options in select
    const handleOptionGamesChange = (e) => {
        const value = e.target.value;
        setSelectOptionGames(value);
    }

    const handleOptionDurationChange = (e) => {
        const value = e.target.value;
        setSelectOptionDuration(value);
    }

    const addBase64 = async (num) => {
        const image = toPngImages[num].domGlobal.current;
        const index = toPngImages[num].index;
        const comment = comments[index].data.body;
        const dataUrl = await toPng(image);
        return { dataUrl, comment, index };
    }

    const htmlToPng = async () => {
        await addBase64(0).then(({ dataUrl, comment, index }) => {
            imagesIndex.push({ dataUrl, index });
            imagesComment.push({ comment, index });
        });
        await addBase64(1).then(({ dataUrl, comment, index }) => {
            imagesIndex.push({ dataUrl, index });
            imagesComment.push({ comment, index });
        });
        await addBase64(2).then(({ dataUrl, comment, index }) => {
            imagesIndex.push({ dataUrl, index });
            imagesComment.push({ comment, index });
        });
    }

    const handleVideoGrabbing = async () => {
        if (commentIndex.length < 3) return setResponseMessage('Please select at least 3 comments');
        setBtnloading(true);
        setResponseMessage('');

        setShowPlayer(false);
        setShowPlayBtn(false);

        try {

            setResponseMessage('Getting screenshots');
            await htmlToPng();
            setResponseMessage('Converting text to speech');
            if (imagesComment.length === 3 && imagesIndex.length === 3) {
                const res = await storeImage(imagesIndex);
                if (res) {
                    setResponseMessage(res.data.message);
                    setResponseStatus(res.status);
                }
                const res2 = await getTextToSpeech(imagesComment);
                if (res2) {
                    setResponseMessage(res2.data.message);
                    setResponseStatus(res2.status);
                }
                const res3 = await convertVideo(selectOptionGames, selectOptionDuration);
                if (res3) {
                    setResponseMessage(res3.data.message);
                    setResponseStatus(res3.status);
                    if (res3.status === 200) {
                        setShowPlayer(true);
                        setBtnloading(false);
                        setShowPlayBtn(true)
                    }
                }
            }
        }
        catch (err) {
            console.log(err)
            setResponseStatus(500);
            setBtnloading(false);
        };

    }

    useEffect(() => {
        //check internet connection
        if (!navigator.onLine) {
            alert("You are not connected to the internet");
        }
    }, []);

    const handleVideoPlay = () => {
        setShowPlayer(!showPlayer);
    }


    return (
        <div className='Home__main'>
            <button onClick={handlePost}>{loading ? 'Fetching ...' : 'Get post'}</button>
            {posts && (
                <>
                    <div className='post'>
                        <span>{posts.title}</span>
                        <div>Comments : {posts.num_comments}</div>
                    </div>
                    <span style={{ cursor: 'pointer' }} onClick={handleComments}>
                        {showComments ? 'Hide comments' : 'Show comments'}</span>
                    <span style={{ width: '100%', textAlign: 'center' }}>Select up to 3 comments</span>
                    <div className='comments'>

                        <div className='allcomments'>
                            {showComments && (
                                loaderComments ? 'Fetching comments ...' : (
                                    comments?.map((comment, index) => (
                                        <div className='comment'
                                            key={index}
                                            ref={index === 0 ? domRef1 : index === 1 ? domRef2 : index === 2 ? domRef3 : index === 3 ? domRef4 : domRef5}
                                            data-key={comment.data.id}
                                            data-index={index}
                                            onClick={(e) => handleSelectComment(e)}
                                            style={{ border: commentIndex.includes(comment.data.id) ? `2px double limegreen` : '2px solid #dbdbdb', cursor: 'pointer' }}>
                                            <div className='right'>
                                            </div>
                                            <div className='left'>
                                                <div className='comment_author'>Posted by <b>{comment.data.author}</b>&nbsp; &#9702; {moment.unix(comment.data.created_utc).fromNow()}</div>
                                                <div className='comment_body'>{comment.data.body}</div>
                                            </div>
                                        </div>
                                    )))
                            )}
                        </div>
                        <div className='selected_comments'>
                            {showComments && (
                                <>
                                    <div className='options'>
                                        <span>{commentIndex.length < 3 ? `Select ${3 - commentIndex.length} ${commentIndex.length === 0 ? 'comments' : 'more'}` : 'You are good to go'}</span>
                                        <span>Select a background video</span>
                                        <select value={selectOptionGames} onChange={(e) => handleOptionGamesChange(e)}>
                                            {games.map((game, index) => (
                                                <option key={index} value={game.url}>{game.title}</option>
                                            ))}
                                        </select>
                                        <span>Select the length of the video in seconds</span>
                                        <select value={selectOptionDuration} onChange={(e) => handleOptionDurationChange(e)}>
                                            <option value='30'>30</option>
                                            <option value='60'>60</option>
                                            <option value='90'>90</option>
                                            <option value='120'>120</option>
                                        </select>

                                        <button disabled={btnloading} onClick={handleVideoGrabbing} >
                                            {btnloading ? 'Generating' : 'Click on generate'}
                                        </button>
                                        <span>{`${responseMessage}`}</span>
                                        {showPlayBtn && <>
                                            <button onClick={handleVideoPlay}>{showPlayer ? 'Hide Player' : 'Show Player'}</button></>}
                                    </div>
                                    {showPlayer && (
                                        <div className='video_player'>
                                            <Player />
                                        </div>
                                    )}

                                </>
                            )}
                        </div>
                    </div>
                </>
            )}
            {error && <div>{error}</div>}

        </div>
    )
}

export default Home;