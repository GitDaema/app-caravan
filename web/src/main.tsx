import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './styles/globals.css'
import App from './App'
import Landing from './routes/Landing'
import Login from './routes/Login'
import Dashboard from './routes/Dashboard'
import ProtectedRoute from './routes/ProtectedRoute'
import PublicRoute from './routes/PublicRoute'
import './pwa'

const router = createBrowserRouter([
  { path: '/', element: <Landing /> },
  { path: '/login', element: <PublicRoute><Login /></PublicRoute> },
  { path: '/app', element: <ProtectedRoute><App><Dashboard /></App></ProtectedRoute> },
])

const queryClient = new QueryClient()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </React.StrictMode>
)

