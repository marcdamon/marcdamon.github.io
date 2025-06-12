// ✅ supabase-init.js
const { createClient } = supabase;

window.supabase = createClient(
  'https://htapkhvxskvqidtugegq.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh0YXBraHZ4c2t2cWlkdHVnZWdxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc5NTEyMjMsImV4cCI6MjA2MzUyNzIyM30.m1VLqQwi_Ch_VbbGm4rzvMguxH7YXn5gExmgYPDqFXU'
);