﻿import 'whatwg-fetch';

import { HttpError } from './HttpHelpers';
import HttpStatus from './HttpStatus';

type Headers = {[index: string]: string};

// See Fetch type definition is lacking https://github.com/Microsoft/TSJS-lib-generator/issues/200
type RequestCredentials = 'omit' | 'same-origin' | 'include';

interface DefaultOptions {
  readonly credentials: RequestCredentials;
}

const defaultOptions: DefaultOptions = {
  credentials: 'same-origin'
};

const JSON_HEADERS: Headers = {
  'Accept': 'application/json',
  'Content-Type': 'application/json'
};

export function postJSON<T>(url: string, body: any) {
  return fetch(url, {
      ...defaultOptions,
      method: 'POST',
      headers: JSON_HEADERS,
      body: JSON.stringify(body)
    })
    .then(debugThrottle)
    .then(checkStatus)
    .then(response => parseJSON<T>(response));
}

export function putJSON<T>(url: string, body: any) {
  return fetch(url, {
      ...defaultOptions,
      method: 'PUT',
      headers: JSON_HEADERS,
      body: JSON.stringify(body)
    })
    .then(debugThrottle)
    .then(checkStatus)
    .then(response => parseJSON<T>(response));
}

export function getJSON<T>(url: string, headers?: Headers) {
  return fetch(url, {
      ...defaultOptions,
      headers: { ...JSON_HEADERS, ...headers }
    })
    .then(debugThrottle)
    .then(checkStatus)
    .then(response => parseJSON<T>(response));
}

export function deleteJSON<T>(url: string) {
  return fetch(url, {
      ...defaultOptions,
      method: 'DELETE',
      headers: JSON_HEADERS
    })
    .then(debugThrottle)
    .then(checkStatus)
    .then(response => parseJSON<T>(response));
}

// See Handling HTTP error statuses https://github.com/github/fetch#handling-http-error-statuses
function checkStatus(response: Response) {
  // Response examples under Chrome 58:
  //
  // {
  //   body: ReadableStream,
  //   bodyUsed: false,
  //   headers: Headers,
  //   ok: false,
  //   redirected: false,
  //   status: 404,
  //   statusText: 'Not Found',
  //   type: 'basic',
  //   url: 'https://...'
  // }
  //
  // {
  //   body: ReadableStream,
  //   bodyUsed: false,
  //   headers: Headers,
  //   ok: false,
  //   redirected: false,
  //   status: 400,
  //   statusText: 'Bad Request',
  //   type: 'basic',
  //   url: 'https://...'
  // }

  if (response.status >= HttpStatus.OK_200 && response.status < HttpStatus.MultipleChoices_300) {
    return response;
  } else {
    const error = new HttpError(response.statusText);
    error.response = response;
    throw error;
  }
}

function debugThrottle(response: Response) {
  return response;
}

/*
function debugThrottle(response: Response) {
  function random(min: number, max: number) {
    return Math.floor(Math.random() * max) + min;
  }

  return new Promise(resolve =>
    setTimeout(resolve, random(1000, 5000))
  ).then(() => response);
}
*/

function parseJSON<T>(response: Response) {
  // An empty string is not valid JSON so JSON.parse() fails
  if (response.status !== HttpStatus.NoContent_204) {
    return response.json() as Promise<T>;
  } else {
    return new Promise<T>((resolve, reject) => resolve());
  }
}
