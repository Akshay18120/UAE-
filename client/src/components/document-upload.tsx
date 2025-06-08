import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/use-language";
import { apiRequest } from "@/lib/queryClient";
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  X,
  File
} from "lucide-react";

interface DocumentUploadProps {
  onNext: () => void;
  onBack: () => void;
  userId?: number;
  applicationId?: number;
}

interface DocumentFile {
  id: string;
  file: File;
  type: string;
  status: 'uploading' | 'uploaded' | 'verified' | 'rejected';
  progress: number;
  url?: string;
}

const requiredDocuments = [
  { type: 'trade_license', label: 'tradeLicenseDoc', required: true },
  { type: 'bank_statements', label: 'bankStatements', required: true },
  { type: 'financial_statements', label: 'financialStatements', required: false },
  { type: 'business_plan', label: 'businessPlan', required: false },
];

export default function DocumentUpload({ onNext, onBack, userId = 1, applicationId = 1 }: DocumentUploadProps) {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [documents, setDocuments] = useState<DocumentFile[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const isRTL = language === 'ar';

  const uploadDocumentMutation = useMutation({
    mutationFn: async (documentData: any) => {
      const response = await apiRequest('POST', '/api/documents', documentData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/documents'] });
    },
  });

  const handleFileSelect = (files: FileList | null, documentType?: string) => {
    if (!files) return;

    Array.from(files).forEach((file) => {
      // Validate file type
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid File Type",
          description: "Please upload PDF, JPG, or PNG files only.",
          variant: "destructive",
        });
        return;
      }

      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Please upload files smaller than 10MB.",
          variant: "destructive",
        });
        return;
      }

      const documentFile: DocumentFile = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        file,
        type: documentType || 'other',
        status: 'uploading',
        progress: 0,
      };

      setDocuments(prev => [...prev, documentFile]);

      // Simulate upload progress
      simulateUpload(documentFile);
    });
  };

  const simulateUpload = async (documentFile: DocumentFile) => {
    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setDocuments(prev => prev.map(doc => 
        doc.id === documentFile.id 
          ? { ...doc, progress: Math.min(doc.progress + 10, 100) }
          : doc
      ));
    }, 200);

    // After 2 seconds, complete the upload
    setTimeout(async () => {
      clearInterval(progressInterval);
      
      try {
        // Create document record
        const documentData = {
          userId,
          applicationId,
          documentType: documentFile.type,
          fileName: documentFile.file.name,
          fileUrl: `https://storage.example.com/${documentFile.id}/${documentFile.file.name}`, // Mock URL
          fileSize: documentFile.file.size,
        };

        await uploadDocumentMutation.mutateAsync(documentData);

        setDocuments(prev => prev.map(doc => 
          doc.id === documentFile.id 
            ? { 
                ...doc, 
                status: 'uploaded', 
                progress: 100,
                url: documentData.fileUrl
              }
            : doc
        ));

        toast({
          title: "Document Uploaded",
          description: `${documentFile.file.name} has been uploaded successfully.`,
        });

      } catch (error) {
        setDocuments(prev => prev.map(doc => 
          doc.id === documentFile.id 
            ? { ...doc, status: 'rejected', progress: 0 }
            : doc
        ));

        toast({
          title: "Upload Failed",
          description: `Failed to upload ${documentFile.file.name}. Please try again.`,
          variant: "destructive",
        });
      }
    }, 2000);
  };

  const removeDocument = (documentId: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== documentId));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const getStatusIcon = (status: DocumentFile['status']) => {
    switch (status) {
      case 'uploading':
        return <Clock className="w-4 h-4 text-blue-500" />;
      case 'uploaded':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'verified':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'rejected':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <FileText className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: DocumentFile['status']) => {
    switch (status) {
      case 'uploading':
        return <Badge variant="secondary">{t('uploading')}</Badge>;
      case 'uploaded':
        return <Badge className="bg-blue-100 text-blue-700">{t('uploaded')}</Badge>;
      case 'verified':
        return <Badge className="bg-green-100 text-green-700">{t('verified')}</Badge>;
      case 'rejected':
        return <Badge variant="destructive">{t('rejected')}</Badge>;
      default:
        return <Badge variant="outline">{t('pending')}</Badge>;
    }
  };

  const requiredDocumentsUploaded = requiredDocuments
    .filter(doc => doc.required)
    .every(doc => documents.some(uploaded => uploaded.type === doc.type && uploaded.status !== 'rejected'));

  return (
    <div className={`space-y-6 ${isRTL ? 'rtl' : ''}`}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-6 h-6" />
            {t('uploadDocuments')}
          </CardTitle>
          <p className="text-gray-600">{t('uploadDescription')}</p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Required Documents Checklist */}
          <div className="grid md:grid-cols-2 gap-4">
            {requiredDocuments.map((docType) => {
              const uploadedDoc = documents.find(doc => doc.type === docType.type);
              const isUploaded = uploadedDoc && uploadedDoc.status !== 'rejected';
              
              return (
                <div key={docType.type} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {isUploaded ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <FileText className="w-5 h-5 text-gray-400" />
                      )}
                      <span className="font-medium">
                        {t(docType.label)}
                        {docType.required && <span className="text-red-500 ml-1">*</span>}
                      </span>
                    </div>
                    {isUploaded && getStatusBadge(uploadedDoc.status)}
                  </div>
                  
                  {!isUploaded && (
                    <div>
                      <input
                        type="file"
                        id={`upload-${docType.type}`}
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => handleFileSelect(e.target.files, docType.type)}
                        className="hidden"
                      />
                      <label
                        htmlFor={`upload-${docType.type}`}
                        className="inline-flex items-center gap-2 text-sm text-uae-blue hover:text-blue-700 cursor-pointer"
                      >
                        <Upload className="w-4 h-4" />
                        {t('uploadFile')}
                      </label>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Drag & Drop Area */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragOver 
                ? 'border-uae-blue bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {t('dragAndDrop')}
            </h3>
            <p className="text-gray-600 mb-4">
              {t('supportedFormats')}
            </p>
            <input
              type="file"
              id="file-upload"
              multiple
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => handleFileSelect(e.target.files)}
              className="hidden"
            />
            <label
              htmlFor="file-upload"
              className="inline-flex items-center gap-2 bg-uae-blue text-white px-4 py-2 rounded-lg hover:bg-blue-700 cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              {t('uploadFile')}
            </label>
          </div>

          {/* Uploaded Documents List */}
          {documents.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">{t('uploaded')} {t('documents')}</h3>
              {documents.map((document) => (
                <div key={document.id} className="flex items-center justify-between border rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(document.status)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{document.file.name}</span>
                        {getStatusBadge(document.status)}
                      </div>
                      <p className="text-sm text-gray-600">
                        {(document.file.size / 1024 / 1024).toFixed(2)} MB • {t(requiredDocuments.find(d => d.type === document.type)?.label || document.type)}
                      </p>
                      {document.status === 'uploading' && (
                        <Progress value={document.progress} className="mt-2 h-2" />
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeDocument(document.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-4 pt-6 border-t">
            <Button 
              variant="outline" 
              onClick={onBack}
              className="flex-1"
            >
              {t('back')}
            </Button>
            <Button 
              onClick={onNext}
              disabled={!requiredDocumentsUploaded}
              className="flex-1 bg-uae-blue hover:bg-blue-700"
            >
              {t('next')}
            </Button>
          </div>

          {!requiredDocumentsUploaded && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-amber-700">
                <AlertCircle className="w-5 h-5" />
                <span className="font-medium">
                  Please upload all required documents to continue
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
