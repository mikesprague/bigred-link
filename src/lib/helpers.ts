const apiKey = import.meta.env.VITE_IP_GEOLOCATION_API_KEY;

export const isProduction = () =>
  window.location.hostname !== 'localhost' &&
  window.location.hostname !== '127.0.0.1';

export const getClientGeoIpInfo = async () => {
  const geoIpData = await fetch(
    `https://api.ipgeolocation.io/v3/ipgeo?apiKey=${apiKey}`
  )
    .then((response) => response.json())
    .catch((error) => console.error(error));
  // console.log(geoIpData);

  return geoIpData;
};

export const isValidUrl = (url: string) => {
  try {
    // @ts-ignore
    // oxlint-disable-next-line no-unused-vars
    const validUrl = new URL(url);
  } catch (error) {
    console.error(error);

    return false;
  }

  return true;
};

export const handleError = (error: Error) => {
  if (isProduction()) {
    // @ts-ignore
    bugsnagClient.notify(error);
  }

  console.error(error);
  // throw new Error(error);
};
