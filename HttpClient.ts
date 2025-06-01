import { request as httpsRequest } from 'node:https'
import { URL } from 'node:url'
import type { RequestOptions } from 'node:https'

export class HTTPClient {

  // Performs a GET request and parses JSON response
  async get<T>(endpoint: string, headers?: Record<string, string>): Promise<T> {
    const url = new URL(endpoint)
    const options: RequestOptions = {
      hostname: url.hostname,
      path: url.pathname + url.search,
      method: 'GET'
    }

    return new Promise<T>((resolve, reject) => {
      const req = httpsRequest(options, res => {
        let data = ''
        res.on('data', chunk => { data += chunk })
        res.on('end', () => {
          if (res.statusCode !== 200) {
            return reject(new Error(`HTTP request failed with status ${res.statusCode}: ${data}`))
          }
          try {
            resolve(JSON.parse(data) as T)
          } catch (err) {
            reject(new Error(`Invalid JSON response: ${err}`))
          }
        })
      })
      req.on('error', reject)
      req.end()
    })
  }

  // Performs a POST request with JSON body and parses JSON response   
  async post<T>(endpoint: string, body: unknown, headers?: Record<string, string>): Promise<T> {
    const url = new URL(endpoint)
    const payload = JSON.stringify(body)
    const options: RequestOptions = {
      hostname: url.hostname,
      path: url.pathname + url.search,
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }

    return new Promise<T>((resolve, reject) => {
      const req = httpsRequest(options, res => {
        let data = ''
        res.on('data', chunk => { data += chunk })
        res.on('end', () => {
          if (res.statusCode !== 200) {
            return reject(new Error(`HubSpot API responded ${res.statusCode}: ${data}`))
          }
          try {
            resolve(JSON.parse(data) as T)                                  
          } catch (err) {
            reject(new Error(`Invalid JSON response: ${err}`))
          }
        })
      })
      req.on('error', reject)                                                  
      req.write(payload)                                                  
      req.end()                                                                
    })
  }
}