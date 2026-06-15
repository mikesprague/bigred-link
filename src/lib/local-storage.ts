import dayjs from 'dayjs';

export function setData(key: string, data: unknown) {
  const dataToSet = JSON.stringify(data);
  localStorage.setItem(key, dataToSet);
}

export function getData(key: string) {
  const dataToGet = localStorage.getItem(key);
  return JSON.parse(dataToGet as string);
}

export function clearData(key: string) {
  localStorage.removeItem(key);
}

export function resetData() {
  localStorage.clear();
}

export function isCached(key: string) {
  return getData(key) !== null;
}

export function isCacheValid(
  key: string,
  duration: number,
  durationType: dayjs.ManipulateType
) {
  const lastUpdated = getData(key);
  const nextUpdateTime = dayjs(lastUpdated).add(duration, durationType);
  if (dayjs().isAfter(nextUpdateTime) ?? lastUpdated === null) {
    return false;
  }
  return true;
}
