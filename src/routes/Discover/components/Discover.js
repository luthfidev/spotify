import React, { useState, useEffect, Suspense } from "react";
import axios from "axios";
import qs from "qs";
import config from "../../../config";
import Spinner from "../../../common/components/Spinner";
import "../styles/_discover.scss";
const DiscoverBlock = React.lazy(() =>
  import("./DiscoverBlock/components/DiscoverBlock")
);

const Discover = () => {
  //state show error 
  const [error, setError] = useState(null)
  //state data 
  const [newReleases, setNewReleases] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [categories, setCategories] = useState([]);

  //buffer clientId & clientScret
  const auth_token = Buffer.from(
    `${config.api.clientId}:${config.api.clientSecret}`,
    "utf-8"
  ).toString("base64");

  // list endoint 
  let endpoints = [
    `${config.api.baseUrl.concat("/browse/new-releases")}`,
    `${config.api.baseUrl.concat("/browse/featured-playlists")}`,
    `${config.api.baseUrl.concat("/browse/categories")}`,
  ];

  //Auth
  const getAuth = async () => {
    try {
      const data = qs.stringify({ grant_type: "client_credentials" });

      const response = await axios.post(config.api.authUrl, data, {
        headers: {
          Authorization: `Basic ${auth_token}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });
      //return access token
      return response.data.access_token;
    } catch (error) {
      setError(error)
    }
  };

  useEffect(() => {
    getDiscovery();
  }, []);

  //get Discovery with Promise
  const getDiscovery = async () => {
    const token = await getAuth();
    const headerAxios = {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    };
    Promise.all(endpoints.map((endpoint) => axios.get(endpoint, headerAxios)))
      .then(
        ([
          { data: newRelease },
          { data: feateuredPlaylists },
          { data: categories },
        ]) => {
          setNewReleases(newRelease.albums.items);
          setPlaylists(feateuredPlaylists.playlists.items);
          setCategories(categories.categories.items);
        }
      )
      .catch((error) => {
        setError(error)
      });
  };

  //if catch error show error
  if (error) {
    return <div><h1>Something Error</h1></div>
  }

  return (
    <div className="discover">
      {/* Lazy load */}
      <Suspense fallback={<Spinner />}>
        <DiscoverBlock
          text="RELEASED THIS WEEK"
          id="released"
          data={newReleases}
        />
      </Suspense>

      <Suspense fallback={<Spinner />}>
        <DiscoverBlock
          text="FEATURED PLAYLISTS"
          id="featured"
          data={playlists}
        />
      </Suspense>
      <Suspense fallback={<Spinner />}>
        <DiscoverBlock
          text="BROWSE"
          id="browse"
          data={categories}
          imagesKey="icons"
        />
      </Suspense>
    </div>
  );
  // }
};
export default Discover;
