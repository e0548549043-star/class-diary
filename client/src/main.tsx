import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import '@tabler/icons-webfont/dist/tabler-icons.min.css';

import './api/api.ts'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { UserProvider } from './context/UserContext.tsx'
import { RouterProvider } from 'react-router-dom'
import { router } from './routs/AppRoutes.tsx'


const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(

  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <UserProvider>
   <RouterProvider router={router} />
   
    </UserProvider>
    </QueryClientProvider>
  </StrictMode>,
)
