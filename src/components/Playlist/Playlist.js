import React, {Component} from 'react';
import './Playlist.css';
import {Button, Divider, List, Typography,} from '@material-ui/core';

import Track from '../Track';
import TrackMenu from '../TrackMenu';

import tracks from './tracks.json';

class Playlist extends Component {

    static propTypes = {};

    /**
     * It toggles play all tracks
     */
    playAllToggle = () => {
        let {isPlayingAll} = this.state;

        isPlayingAll = !isPlayingAll && this.hasTracks();

        this.setState({
            isSyncing: false,
            isPlayingAll
        });
    };

    /**
     * It toggles sync playlist- all tracks will be played at leader's track tempo('music speed/bpm')
     */
    playSyncToggle = () => {
        let {isSyncing} = this.state;
        isSyncing = !isSyncing && this.hasTracks();

        this.setState({
            isSyncing,
            isPlayingAll: false
        });
    };


    /**
     * It updates the duration of the loaded track into the metadata list.
     * In sync mode- it reorders the tracks by their length(duration)
     * @param track the data-object model
     * @param duration the track's length
     */
    handleTrackLoaded = (track, duration) => {
        let {Metadata, isSyncing} = this.state;

        let trackMetadata = this.findTrackById(Metadata, track.Id);
        Object.assign(trackMetadata, {duration});

        this.setState({
            Metadata
        });

        if (isSyncing) {
            this.sortByTrackLength();
            this.updateLeaderBPM();
        }
    };

    /** It returns true if the playlist contains tracks **/
    hasTracks = () => {
        const {playlist} = this.state;
        return playlist.length > 0;
    };

    /**
     * It adds the track to the playlist
     * @param track data-object model
     */
    addTrack = track => {
        if (track === undefined) {
            return;
        }

        const {playlist, Metadata} = this.state;

        this.setState({
            isSyncing: false,
            isPlayingAll : false,
            playlist: [...playlist, track],
            Metadata: [...Metadata, {Id: track.Id, duration: 0}]
        });
    };

    /**
     * It removes the track from the playlist and its metadata
     * @param track
     */
    removeTrack = track => {
        if (track === undefined) {
            return;
        }

        const {playlist, Metadata} = this.state;

        this.setState({
            playlist: playlist.filter((x) => x !== track),
            Metadata: Metadata.filter((x)=> x.Id !== track.Id)
        });
    };

    updateLeaderBPM() {
        let {bpm} = this.getLeaderTrack();
        this.setState({leaderBPM: bpm});
    }

    findTrackById = (list, trackId) =>{
        return list.find(item=> item.Id === trackId);
    };

    /**
     * It sorts Metadata list by track length(duration)
     */
    sortByTrackLength() {
        let {playlist, Metadata} = this.state;

        playlist.sort((a,b) => (this.findTrackById(Metadata, b.Id).duration) - this.findTrackById(Metadata, a.Id).duration);

        this.setState({playlist});
    }

    /**
     * It returns the longest track
     * Note: Metadata holds the duration of each track
     */
    getLeaderTrack() {
        const {playlist, Metadata} = this.state;

        if(playlist.length===0){
            return;
        }
        else if(playlist.length<2){
            return playlist[0];
        }

        const leaderTrack = Metadata.reduce((a, b) => a.duration > b.duration? a : b, 0);
        return this.findTrackById(playlist, leaderTrack.Id);
    }

    constructor(props) {
        super(props);

        this.state = {
            playlist: [],
            Metadata: [],
            isPlayingAll: false,
            isSyncing: false
        };
    }

    render() {
        const {playlist, isPlayingAll, isSyncing, leaderBPM} = this.state;

        const trackList = playlist.map(track => {
            return (
                <Track key={track.Id}
                       dto={track}
                       isPlayingAll={isPlayingAll}
                       isSyncing={isSyncing}
                       leaderBPM={leaderBPM}
                       onTrackRemove={this.removeTrack}
                       onLoaded={this.handleTrackLoaded}
                       onLeaderBPMChange={(bpm) => this.setState({leaderBPM: bpm})}
                />);
        });

        const availableTracks = tracks.filter(track => playlist.includes(track) === false);

        const playText = !this.hasTracks() || !isPlayingAll ? 'Play' : 'Stop All';
        const syncText = !this.hasTracks() || !isSyncing ? 'Sync' : 'Stop All';

        return (
            <div className="playlist-root">
                <div className="playlist-actions">
                    <Button disabled={!this.hasTracks()} onClick={this.playSyncToggle}>{syncText}</Button>
                    <Button disabled={!this.hasTracks()} onClick={this.playAllToggle}>{playText}</Button>
                </div>
                <Typography variant="display1">Musico Looper</Typography>
                <Divider></Divider>

                <TrackMenu tracks={availableTracks} onTrackAdd={this.addTrack}/>
                <List>
                    {trackList}
                </List>
            </div>
        );
    }
}

export default Playlist;
