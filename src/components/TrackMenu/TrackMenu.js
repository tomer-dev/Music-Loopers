import React, {Component} from 'react';
import PropTypes from 'prop-types';
import './TrackMenu.css';
import {
    IconButton,
    InputLabel, MenuItem, FormHelperText, FormControl, Select
} from '@material-ui/core';

import {
    PlaylistAdd as AddIcon
} from '@material-ui/icons';

class TrackMenu extends Component {

    static propTypes = {
        tracks: PropTypes.array.isRequired,
        onTrackAdd: PropTypes.func
    };

    /**
     * It extracts a file title from url.
     * @param url files remotes address
     * @returns {string} readable track title
     */
    static titleFromUrl(url){
        if(url === undefined){
            return '';
        }

        let filename = url.substring(url.lastIndexOf("/")+1);
        let dotIndex = filename.lastIndexOf(".");
        let trackTitle = dotIndex>-1? filename.substring(0, dotIndex) : filename;
        return trackTitle && trackTitle.replace('+',' ');
    }

    constructor(props) {
        super(props);

        this.state = {
            selected: ''// selected track element
        };
    }

    /**
     * It sets the selected track Id
     * @param event
     */
    handleTrackSelected = event => {
        const selected = event.target.value;

        this.setState({
            selected
        });
    };

    /**
     * It finds the track by its Id and calls onTrackAdd callback- the function of the parent component.
     */
    addSelectedTrack = () => {
        const {selected} = this.state;
        const {tracks, onTrackAdd} = this.props;

        const selectedTrack = tracks.find((track)=> track.Id === selected);
        onTrackAdd(selectedTrack);
        this.setState({
            selected: ''
        })
    };

    render() {
        const {selected} = this.state;
        const {tracks} = this.props;

        const trackMenuItems = tracks.map(track => {
            return <MenuItem key={track.Id} value={track.Id}>{TrackMenu.titleFromUrl(track.url)}</MenuItem>
        });

        return (
            <form className="track-menu-root" autoComplete="off">
                <FormControl className="track-menu">
                    <InputLabel htmlFor="track-menu">Select Track</InputLabel>
                    <Select
                        value={selected}
                        onChange={this.handleTrackSelected}
                        inputProps={{
                            name: 'Add Track',
                            id: 'track-menu'
                        }}
                    >
                        <MenuItem value=''>
                            <em></em>
                        </MenuItem>
                        {trackMenuItems}
                    </Select>
                    <FormHelperText>Add track to playlist</FormHelperText>
                </FormControl>
                <IconButton style={{margin: 'auto 0'}} onClick={this.addSelectedTrack}> <AddIcon /></IconButton>
            </form>
        );
    }
}

export default TrackMenu;
