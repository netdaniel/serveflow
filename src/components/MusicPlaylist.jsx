import React, { useState } from 'react';
import { Music, Video, ExternalLink, X, Plus, Play, Pause } from 'lucide-react';
import { useStore } from '../services/store';

const PLATFORMS = {
  youtube: { name: 'YouTube', icon: Video, color: 'text-red-500', bgColor: 'bg-red-50' },
  spotify: { name: 'Spotify', icon: Music, color: 'text-green-500', bgColor: 'bg-green-50' },
  apple_music: { name: 'Apple Music', icon: Music, color: 'text-black', bgColor: 'bg-gray-50' },
  soundcloud: { name: 'SoundCloud', icon: Music, color: 'text-orange-500', bgColor: 'bg-orange-50' },
};

export default function MusicPlaylist({ eventId, initialPlaylists = [], hideHeader = false }) {
  const { addEventPlaylist, getEventPlaylists, updateEventPlaylist, deleteEventPlaylist } = useStore();
  const [playlists, setPlaylists] = useState(initialPlaylists);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    platform: 'youtube',
    url: '',
    name: '',
    description: ''
  });
  const [addingPlaylist, setAddingPlaylist] = useState(false);

  const handleAddPlaylist = async (e) => {
    e.preventDefault();
    if (!formData.url || !formData.name) return;

    setAddingPlaylist(true);
    
    try {
      const playlistData = {
        platform: formData.platform,
        url: formData.url,
        name: formData.name,
        description: formData.description
      };

      await addEventPlaylist(eventId, playlistData);
      
      // Refresh playlists
      const updatedPlaylists = await getEventPlaylists(eventId);
      setPlaylists(updatedPlaylists);
      
      // Reset form
      setFormData({
        platform: 'youtube',
        url: '',
        name: '',
        description: ''
      });
      setShowAddForm(false);
    } catch (error) {
      console.error('Error adding playlist:', error);
      alert('Error adding playlist: ' + error.message);
    } finally {
      setAddingPlaylist(false);
    }
  };

  const handleDelete = async (playlistId) => {
    try {
      await deleteEventPlaylist(playlistId);
      const updatedPlaylists = await getEventPlaylists(eventId);
      setPlaylists(updatedPlaylists);
    } catch (error) {
      console.error('Error deleting playlist:', error);
      alert('Error deleting playlist: ' + error.message);
    }
  };

  const getPlatformInfo = (platform) => {
    return PLATFORMS[platform] || PLATFORMS.youtube;
  };

  const isValidUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  return (
    <div className="space-y-4">
      {/* Add Playlist Button */}
      <div className="flex justify-between items-center">
        {!hideHeader && (
          <h4 className="font-semibold text-navy-500 flex items-center gap-2">
            <Music className="w-5 h-5" />
            Event Playlists
          </h4>
        )}
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-3 py-1.5 text-sm bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
        >
          <Plus size={16} />
          Add Playlist
        </button>
      </div>

      {/* Add Playlist Form */}
      {showAddForm && (
        <div className="bg-white p-4 rounded-xl border border-navy-200">
          <form onSubmit={handleAddPlaylist} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-navy-500 mb-1">Platform</label>
                <select
                  className="w-full px-4 py-2 border border-navy-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all bg-white"
                  value={formData.platform}
                  onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                >
                  {Object.entries(PLATFORMS).map(([key, platform]) => (
                    <option key={key} value={key}>{platform.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-navy-500 mb-1">Playlist Name</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 border border-navy-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                  placeholder="e.g. Worship Set, Background Music"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-navy-500 mb-1">Playlist URL</label>
              <input
                type="url"
                required
                className="w-full px-4 py-2 border border-navy-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                placeholder="Paste YouTube, Spotify, or other playlist URL"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              />
              {!isValidUrl(formData.url) && formData.url && (
                <p className="text-xs text-red-500 mt-1">Please enter a valid URL</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-navy-500 mb-1">Description (Optional)</label>
              <textarea
                className="w-full px-4 py-2 border border-navy-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all resize-none"
                rows="2"
                placeholder="Describe the playlist purpose..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="flex-1 px-4 py-2 border border-navy-200 text-navy-500 font-medium rounded-lg hover:bg-navy-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!formData.url || !formData.name || addingPlaylist}
                className="flex-1 px-4 py-2 bg-primary-500 text-white font-medium rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {addingPlaylist ? 'Adding...' : 'Add Playlist'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Existing Playlists List */}
      {playlists && playlists.length > 0 && (
        <div className="space-y-3">
          {playlists.map((playlist) => {
            const platformInfo = getPlatformInfo(playlist.platform);
            const PlatformIcon = platformInfo.icon;
            
            return (
              <div 
                key={playlist.id} 
                className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${platformInfo.bgColor}`}>
                    <PlatformIcon className={`w-5 h-5 ${platformInfo.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {playlist.playlist_name || playlist.platform}
                      </p>
                      <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full capitalize">
                        {platformInfo.name}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 truncate">
                      {playlist.description || new URL(playlist.playlist_url).hostname}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <a
                    href={playlist.playlist_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded"
                    title="Open in platform"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  <button
                    onClick={() => handleDelete(playlist.id)}
                    className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded"
                    title="Remove"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {playlists && playlists.length === 0 && !showAddForm && (
        <div className="text-center py-8 text-gray-500">
          <Music className="w-12 h-12 mx-auto text-gray-300 mb-2" />
          <p>No playlists added yet</p>
          <button
            onClick={() => setShowAddForm(true)}
            className="mt-2 text-primary-500 hover:underline text-sm"
          >
            Add your first playlist
          </button>
        </div>
      )}
    </div>
  );
}