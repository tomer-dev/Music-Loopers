import React, {Component} from 'react';
import PropTypes from 'prop-types';
import './Track.css';
import {
    CircularProgress,
    IconButton,
    ListItem,
    ListItemIcon,
    ListItemSecondaryAction,
    ListItemText
} from '@material-ui/core';

import {
    Delete as DeleteIcon,
    Pause,
    PlayArrow,
    Stop,
    VolumeMute as MuteIcon,
    VolumeUp as VolumeIcon
} from '@material-ui/icons';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import Sound from 'react-sound';

class Track extends Component {

    static propTypes = {
        dto: PropTypes.object.isRequired,
        isPlayingAll: PropTypes.bool,
        isSyncing: PropTypes.bool,
        onLoaded: PropTypes.func,
        onTrackRemove: PropTypes.func,
        onLeaderBPMChange: PropTypes.func
    };
    /**
     * It converts milliseconds into MM:ss format.
     * @param duration in milliseconds.
     * @returns {string} MM:ss format e.g. 14:23
     */
    static
    durationToTime = (duration) => {
        let seconds = parseInt((duration / 1000) % 60)
            , minutes = parseInt((duration / (1000 * 60)) % 60);

        minutes = (minutes < 10) ? "0" + minutes : minutes;
        seconds = (seconds < 10) ? "0" + seconds : seconds;

        return minutes + ":" + seconds;
    };

    /**
     * It toggles play/pause.
     * Note: plays the track at its own bpm, without loops.
     */
    togglePlayPause = () => {
        let {playStatus} = this.state;
        const {PLAYING, PAUSED} = Sound.status;

        playStatus = playStatus === PLAYING ? PAUSED : PLAYING;

        this.setState({
            playStatus,
            playbackRate: 1,
            loop: false
        });
    };

    /**
     * It stops the track and resets it to start
     */
    stop = () => {
        this.setState({
            playStatus: Sound.status.PAUSED,
            position: 0
        })
    };

    volumeChange = (volume) => {
        this.setState({
            volume
        });
    };

    /**
     * It toggles sound mute
     */
    toggleMute = () => {
        const {volume} = this.state;

        this.setState({
            volume: volume > 0 ? 0 : 100
        })
    };

    /**
     * It extracts a file title from url.
     * @param url files remotes address
     * @returns {string} readable track title
     */
    static titleFromUrl(url) {
        if (url === undefined) {
            return '';
        }

        let filename = url.substring(url.lastIndexOf("/") + 1);
        let dotIndex = filename.lastIndexOf(".");
        let trackTitle = dotIndex > -1 ? filename.substring(0, dotIndex) : filename;
        return trackTitle && trackTitle.replace('+', ' ');
    }

    /**
     * It plays a track from start, possibly in different speeds - to enable syncing with other tracks
     */
    play = () => {
        this.setState({
            playStatus: Sound.status.PLAYING,
            position: 0,
            playbackRate: this.playbackRate
        });
    };

    constructor(props) {
        super(props);

        this.state = {
            controlled: true,
            position: 0,
            volume: 100,
            playbackRate: 1,
            loop: false,
            duration: 0,
            playStatus: Sound.status.PAUSED
        };
    }

    /**
     * It toggles the loop feature- infinite play
     * and either plays the track from start or stops it
     * @param shouldLoopPlay
     */
    handleLoopPlay(shouldLoopPlay) {
        this.setState({
            loop: shouldLoopPlay
        });

        shouldLoopPlay ? this.play() : this.stop();
    }

    /**
     * An event fired when the track reaches to the end.
     * In case of loop the track won't stop
     */
    onTrackEnded = () => {
        const {loop} = this.state;

        !loop && this.stop();
    };
    /**
     * It notifies the parent component about the tracks duration
     * @param newDuration - duration metadata from react-sound library
     */
    onDurationChange = (newDuration) => {
        const {duration, dto, onLoaded} = this.props;

        if (!duration && newDuration !== duration) {
            onLoaded(dto, newDuration);
        }

        this.setState({duration: newDuration});
    };

    /**
     * Calculates playback rate according to the leader BPM in sync mode
     * @returns {number}
     */
    get playbackRate() {
        const {isSyncing, dto: {bpm}, leaderBPM} = this.props;

        return isSyncing && !isNaN(leaderBPM) ? leaderBPM / bpm : 1;
    }

    /**
     * It loads the track by setting it in PAUSE mode
     */
    componentDidMount() {
        this.setState({
            playStatus: Sound.status.PAUSED
        });
    }

    /**
     * It handles play all or sync features- if triggered track will run in loop mode.
     */
    componentDidUpdate(prevProps) {
        const {isPlayingAll, isSyncing, leaderBPM} = this.props;

        if (isPlayingAll !== prevProps.isPlayingAll ||
            isSyncing !== prevProps.isSyncing) {
            this.handleLoopPlay(isPlayingAll || isSyncing);
        }

        if (leaderBPM !== prevProps.leaderBPM) {
            this.setState({playbackRate: this.playbackRate});
        }
    }

    /**
     * It returns a dynamic icon according to the current sound state
     */
    getPlayStatusIcon() {
        const {PLAYING, PAUSED, STOPPED} = Sound.status;
        const {playStatus} = this.state;

        let IconType;
        switch (playStatus) {
            case PLAYING:
                IconType = Pause;
                break;
            case PAUSED:
                IconType = PlayArrow;
                break;
            case STOPPED:
                IconType = Stop;
                break;
        }

// A progress bar indicating the position of the track
        const progress = <CircularProgress className="circular-progress" variant="static"
                                           value={this.progressState()}/>;

        return <div className="play-button-wrapper"><IconType/>{progress}</div>;
    }

    /**
     * It returns the current track position in percentages, relative to the track duration.
     */
    progressState = () => {
        const {position, duration} = this.state;

        return position / duration * 100;
    };

    render() {
        const {playStatus, position, volume, loop, duration, playbackRate} = this.state;
        const {dto, leaderBPM, isSyncing, onTrackRemove, onLoaded, onLeaderBPMChange} = this.props;
        const {owner, bpm, url} = dto;

        const trackInfo = <div>
            <span className="track-title">{Track.titleFromUrl(url)}</span>
            <br/>
            <span className="album-title">{owner}</span>
        </div>;
        const playStatusIcon = this.getPlayStatusIcon();
        const SpeakerIcon = volume > 0 ? VolumeIcon : MuteIcon;

        const leaderBPMStyle = leaderBPM === bpm && isSyncing ? {fontWeight: 'bold'} : {};
        const bpmElement = <span style={leaderBPMStyle}
                                 className="bpm-title"
                                 onClick={() => onLeaderBPMChange(bpm)}>BPM: {bpm}</span>;
        return (
            <ListItem>
                <ListItemIcon className="play-button" onClick={this.togglePlayPause}>
                    {playStatusIcon}
                </ListItemIcon>
                <ListItemText primary={trackInfo}
                              secondary={bpmElement}>
                </ListItemText>

                <ListItemSecondaryAction>
                    <IconButton aria-label="Delete" onClick={() => onTrackRemove(dto)}>
                        <DeleteIcon/>
                    </IconButton>

                    <ListItemText aria-label="Track bars" className="track-bar-title"
                                  secondary={Track.durationToTime(duration)}/>
                    <div className="volume-bar">
                        <SpeakerIcon aria-label="volume" onClick={this.toggleMute} className="volume-icon"/>
                        <Slider style={{flex: 1}} value={volume} onChange={this.volumeChange} max={100} step={5}
                                defaultValue={100}/>
                    </div>
                </ListItemSecondaryAction>

                <Sound
                    url={url}
                    playStatus={playStatus}
                    position={position} /* in milliseconds */
                    volume={volume}
                    loop={loop}
                    playbackRate={playbackRate}
                    onLoading={({duration}) => this.onDurationChange(duration)}
                    onPlaying={({position, duration}) => this.setState({position, duration})}
                    onFinishedPlaying={this.onTrackEnded}
                />
            </ListItem>
        );
    }
}

export default Track;
