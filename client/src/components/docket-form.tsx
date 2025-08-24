import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import FileUploader from "./file-uploader";
import ReferenceForm from "./reference-form";
import type { Docket } from "@shared/schema";

const docketSchema = z.object({
  passportFrontUrl: z.string().optional(),
  passportLastUrl: z.string().optional(),
  passportPhotoUrl: z.string().optional(),
  educationFiles: z.array(z.object({
    name: z.string(),
    url: z.string(),
    size: z.number(),
  })).default([]),
  experienceFiles: z.array(z.object({
    name: z.string(),
    url: z.string(),
    size: z.number(),
  })).default([]),
  offerLetterUrl: z.string().optional(),
  permanentAddressUrl: z.string().optional(),
  currentAddressUrl: z.string().optional(),
  otherCertifications: z.array(z.object({
    name: z.string(),
    url: z.string(),
    size: z.number(),
  })).default([]),
  references: z.array(z.object({
    fullName: z.string(),
    company: z.string(),
    designation: z.string(),
    phone: z.string(),
    email: z.string(),
  })).default([]),
});

type DocketFormData = z.infer<typeof docketSchema>;

interface DocketFormProps {
  docket?: Docket | null;
  onSubmit?: (data: Partial<DocketFormData>) => void;
  onComplete?: () => void;
  isLoading?: boolean;
  userId?: string;
  isAdminMode?: boolean;
}

export default function DocketForm({ 
  docket, 
  onSubmit, 
  onComplete,
  isLoading = false, 
  userId,
  isAdminMode = false 
}: DocketFormProps) {
  const form = useForm<DocketFormData>({
    resolver: zodResolver(docketSchema),
    defaultValues: {
      passportFrontUrl: docket?.passportFrontUrl || "",
      passportLastUrl: docket?.passportLastUrl || "",
      passportPhotoUrl: docket?.passportPhotoUrl || "",
      educationFiles: docket?.educationFiles || [],
      experienceFiles: docket?.experienceFiles || [],
      offerLetterUrl: docket?.offerLetterUrl || "",
      permanentAddressUrl: docket?.permanentAddressUrl || "",
      currentAddressUrl: docket?.currentAddressUrl || "",
      otherCertifications: docket?.otherCertifications || [],
      references: docket?.references || [],
    },
  });

  const handleSubmit = (data: DocketFormData) => {
    if (onSubmit) {
      onSubmit(data);
    }
  };

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {/* Passport Section */}
          <Card>
            <CardHeader>
              <CardTitle>Passport Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="passportFrontUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Passport Front Page</FormLabel>
                      <FormControl>
                        <FileUploader
                          currentFile={field.value}
                          onUpload={(fileData) => field.onChange((fileData as any).url)}
                          accept="image/*,application/pdf"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="passportLastUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Passport Last Page</FormLabel>
                      <FormControl>
                        <FileUploader
                          currentFile={field.value}
                          onUpload={(fileData) => field.onChange((fileData as any).url)}
                          accept="image/*,application/pdf"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="passportPhotoUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Passport Photo</FormLabel>
                      <FormControl>
                        <FileUploader
                          currentFile={field.value}
                          onUpload={(fileData) => field.onChange((fileData as any).url)}
                          accept="image/*"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Education Section */}
          <Card>
            <CardHeader>
              <CardTitle>Education Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="educationFiles"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Upload Education Documents</FormLabel>
                    <FormControl>
                      <FileUploader
                        currentFiles={field.value}
                        onUpload={field.onChange}
                        multiple={true}
                        accept="image/*,application/pdf"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Experience Section */}
          <Card>
            <CardHeader>
              <CardTitle>Experience Letters</CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="experienceFiles"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Upload Experience Letters</FormLabel>
                    <FormControl>
                      <FileUploader
                        currentFiles={field.value}
                        onUpload={field.onChange}
                        multiple={true}
                        accept="image/*,application/pdf"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Offer Letter Section */}
          <Card>
            <CardHeader>
              <CardTitle>Current Employer Offer Letter</CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="offerLetterUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Upload Current Employer Offer Letter</FormLabel>
                    <FormControl>
                      <FileUploader
                        currentFile={field.value}
                        onUpload={(fileData) => field.onChange((fileData as any).url)}
                        accept="image/*,application/pdf"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Address Proofs Section */}
          <Card>
            <CardHeader>
              <CardTitle>Address Proofs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="permanentAddressUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Permanent Address Proof</FormLabel>
                      <FormControl>
                        <FileUploader
                          currentFile={field.value}
                          onUpload={(fileData) => field.onChange((fileData as any).url)}
                          accept="image/*,application/pdf"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="currentAddressUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Address Proof</FormLabel>
                      <FormControl>
                        <FileUploader
                          currentFile={field.value}
                          onUpload={(fileData) => field.onChange((fileData as any).url)}
                          accept="image/*,application/pdf"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Other Certifications Section */}
          <Card>
            <CardHeader>
              <CardTitle>Other Certifications</CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="otherCertifications"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Upload Professional Certifications</FormLabel>
                    <FormControl>
                      <FileUploader
                        currentFiles={field.value}
                        onUpload={field.onChange}
                        multiple={true}
                        accept="image/*,application/pdf"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* References Section */}
          <Card>
            <CardHeader>
              <CardTitle>Professional References</CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="references"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Add Professional References (Minimum 2)</FormLabel>
                    <FormControl>
                      <ReferenceForm
                        references={field.value}
                        onUpdate={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-4">
            {!isAdminMode && (
              <Button type="button" variant="outline" disabled={isLoading}>
                Save as Draft
              </Button>
            )}
            {isAdminMode ? (
              <div className="space-y-2">
                <Button 
                  type="submit" 
                  variant="outline"
                  disabled={isLoading}
                  className="mr-4"
                >
                  {isLoading ? "Saving..." : "Save Documents"}
                </Button>
                <Button 
                  type="button" 
                  onClick={() => onComplete && onComplete()} 
                  disabled={isLoading}
                  className="bg-orange-600 hover:bg-orange-700 text-white"
                >
                  {isLoading ? "Completing..." : "Complete User's Docket"}
                </Button>
              </div>
            ) : (
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Submitting..." : "Submit Docket"}
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
}
