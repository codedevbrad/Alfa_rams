import { createServer, type Server } from 'http'
import { shell } from 'electron'
import { google } from 'googleapis'
import type { gmail_v1 } from 'googleapis'
import {
  clearGmailAuth,
  getGmailRefreshToken,
  setGmailRefreshToken
} from '../../settings/settings-store'

const GMAIL_SCOPES = [
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.send'
]

function getOAuthClient() {
  const clientId = process.env.GMAIL_CLIENT_ID?.trim()
  const clientSecret = process.env.GMAIL_CLIENT_SECRET?.trim()
  if (!clientId || !clientSecret) {
    throw new Error(
      'Gmail OAuth is not configured. Set GMAIL_CLIENT_ID and GMAIL_CLIENT_SECRET in the environment.'
    )
  }
  return new google.auth.OAuth2(clientId, clientSecret, 'http://127.0.0.1:42813/oauth2callback')
}

export async function getGmailClient(): Promise<gmail_v1.Gmail> {
  const refreshToken = await getGmailRefreshToken()
  if (!refreshToken) {
    throw new Error('Gmail is not connected. Connect Gmail from the Email dashboard.')
  }
  const auth = getOAuthClient()
  auth.setCredentials({ refresh_token: refreshToken })
  return google.gmail({ version: 'v1', auth })
}

export function isGmailConnected(): Promise<boolean> {
  return getGmailRefreshToken().then((t) => Boolean(t))
}

export async function connectGmail(): Promise<void> {
  const oauth2 = getOAuthClient()
  const authUrl = oauth2.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: GMAIL_SCOPES
  })

  const code = await waitForOAuthCode(authUrl)
  const { tokens } = await oauth2.getToken(code)
  if (!tokens.refresh_token) {
    throw new Error('No refresh token received. Revoke app access in Google Account and try again.')
  }
  await setGmailRefreshToken(tokens.refresh_token)
}

export async function disconnectGmail(): Promise<void> {
  await clearGmailAuth()
}

function waitForOAuthCode(authUrl: string): Promise<string> {
  return new Promise((resolve, reject) => {
    let server: Server | null = null
    const timeout = setTimeout(() => {
      server?.close()
      reject(new Error('Gmail sign-in timed out'))
    }, 120_000)

    server = createServer(async (req, res) => {
      try {
        const url = new URL(req.url ?? '/', 'http://127.0.0.1:42813')
        if (url.pathname !== '/oauth2callback') {
          res.writeHead(404)
          res.end()
          return
        }
        const err = url.searchParams.get('error')
        if (err) {
          res.writeHead(400)
          res.end('Sign-in failed. You can close this tab.')
          reject(new Error(err))
          return
        }
        const code = url.searchParams.get('code')
        if (!code) {
          res.writeHead(400)
          res.end('Missing authorization code.')
          reject(new Error('Missing authorization code'))
          return
        }
        res.writeHead(200, { 'Content-Type': 'text/html' })
        res.end(
          '<html><body><p>Gmail connected. You can close this tab and return to Alfa RAMS.</p></body></html>'
        )
        clearTimeout(timeout)
        server?.close()
        resolve(code)
      } catch (e) {
        clearTimeout(timeout)
        server?.close()
        reject(e)
      }
    })

    server.listen(42813, '127.0.0.1', () => {
      void shell.openExternal(authUrl)
    })

    server.on('error', (e) => {
      clearTimeout(timeout)
      reject(e)
    })
  })
}
