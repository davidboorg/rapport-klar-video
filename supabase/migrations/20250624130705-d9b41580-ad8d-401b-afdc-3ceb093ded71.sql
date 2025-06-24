
-- Create storage bucket for documents
INSERT INTO storage.buckets (id, name, public) 
VALUES ('documents', 'documents', true);

-- Create policy for uploading documents (anyone can upload for demo)
CREATE POLICY "Anyone can upload documents" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'documents');

-- Create policy for viewing documents (anyone can view for demo)  
CREATE POLICY "Anyone can view documents" ON storage.objects
FOR SELECT USING (bucket_id = 'documents');
