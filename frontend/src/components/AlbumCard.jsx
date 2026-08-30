// TODO(MAR-15): make this open the album detail page once it exists
const AlbumCard = ({ album }) => (
  <div className="bg-white shadow-md rounded overflow-hidden">
    <div className="aspect-square bg-gray-100 flex items-center justify-center">
      {album.coverImageUrl ? (
        <img src={album.coverImageUrl} alt={album.title} className="w-full h-full object-cover" />
      ) : (
        <span className="text-gray-400 text-sm">No cover</span>
      )}
    </div>
    <div className="p-3">
      <h3 className="font-semibold truncate">{album.title}</h3>
      <p className="text-sm text-gray-600 truncate">{album.artistName}</p>
      <p className="text-sm text-gray-400 mt-1">No ratings yet</p>
    </div>
  </div>
);

export default AlbumCard;
