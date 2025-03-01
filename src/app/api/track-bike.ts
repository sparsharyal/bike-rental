export default function handler(req, res) {
    const demoBikeLocations = [
      { id: 1, name: "Yamaha R15", lat: 27.7172, lng: 85.324 },
      { id: 2, name: "Honda CRF250L", lat: 27.7123, lng: 85.328 },
      { id: 3, name: "Royal Enfield Classic", lat: 27.7150, lng: 85.322 },
    ];
    res.status(200).json(demoBikeLocations);
  }