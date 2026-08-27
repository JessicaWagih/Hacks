import {
  useEffect,
  useState,
} from "react";

import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
} from "react-leaflet";

import L from "leaflet";


// Fix Leaflet marker icons in Vite.
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",

  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",

  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});


function MapClickHandler({
  onLocationSelect,
}) {

  useMapEvents({

    click(e) {

      onLocationSelect(
        e.latlng.lat,
        e.latlng.lng
      );

    },

  });

  return null;
}


export default function LocationPicker({
  value,
  onChange,
}) {

  const defaultCenter = [
    40.743,
    -74.032
  ];

  const [
    position,
    setPosition
  ] = useState(
    value?.latitude && value?.longitude
      ? [
          value.latitude,
          value.longitude
        ]
      : defaultCenter
  );


  const [
    loadingLocation,
    setLoadingLocation
  ] = useState(false);


  async function reverseGeocode(
    latitude,
    longitude
  ) {

    try {

      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`
      );

      const data =
        await response.json();

      const address =
        data.display_name || "";

      const name =
        data.name ||
        data.address?.amenity ||
        data.address?.building ||
        data.address?.shop ||
        address;

      onChange({
        latitude,
        longitude,
        address,
        location: name,
        place_id: data.place_id
          ? String(data.place_id)
          : null,
      });

    } catch {

      onChange({
        latitude,
        longitude,
        location: "Selected map location",
        address: "",
        place_id: null,
      });

    }

  }


  function selectLocation(
    latitude,
    longitude
  ) {

    setPosition([
      latitude,
      longitude
    ]);

    reverseGeocode(
      latitude,
      longitude
    );

  }


  function useCurrentLocation() {

    if (!navigator.geolocation) {

      alert(
        "Your browser does not support location services."
      );

      return;
    }


    setLoadingLocation(true);


    navigator.geolocation.getCurrentPosition(

      (location) => {

        selectLocation(
          location.coords.latitude,
          location.coords.longitude
        );

        setLoadingLocation(false);

      },

      () => {

        alert(
          "We couldn't access your location. Please select it on the map."
        );

        setLoadingLocation(false);

      }

    );

  }


  return (
    <div className="location-picker">

      <div className="location-picker-top">

        <div>
          <h3>
            Where did it happen?
          </h3>

          <p>
            Tap the map or use your current location.
          </p>
        </div>


        <button
          type="button"
          onClick={useCurrentLocation}
          className="current-location-button"
          disabled={loadingLocation}
        >
          📍{" "}
          {loadingLocation
            ? "Finding you..."
            : "Use my location"}
        </button>

      </div>


      <MapContainer
        center={position}
        zoom={14}
        scrollWheelZoom={true}
        className="map"
      >

        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />


        <MapClickHandler
          onLocationSelect={selectLocation}
        />


        {position && (
          <Marker
            position={position}
          />
        )}

      </MapContainer>


      {value?.location && (

        <div className="selected-location">

          <div className="selected-location-icon">
            📍
          </div>

          <div>

            <strong>
              {value.location}
            </strong>

            {value.address && (
              <p>
                {value.address}
              </p>
            )}

            {value.latitude && (
              <small>
                {Number(value.latitude).toFixed(5)},
                {" "}
                {Number(value.longitude).toFixed(5)}
              </small>
            )}

          </div>

        </div>

      )}

    </div>
  );
}