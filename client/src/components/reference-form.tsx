import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Trash2, Plus } from "lucide-react";

const referenceSchema = z.object({
  fullName: z.string().min(1, "Name is required"),
  company: z.string().min(1, "Company is required"),
  designation: z.string().min(1, "Position is required"),
  phone: z.string().min(10, "Valid phone number is required"),
  email: z.string().email("Valid email is required"),
});

type ReferenceData = z.infer<typeof referenceSchema>;

interface ReferenceFormProps {
  references: ReferenceData[];
  onUpdate: (references: ReferenceData[]) => void;
}

export default function ReferenceForm({ references, onUpdate }: ReferenceFormProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const form = useForm<ReferenceData>({
    resolver: zodResolver(referenceSchema),
    defaultValues: {
      fullName: "",
      company: "",
      designation: "",
      phone: "",
      email: "",
    },
  });

  const onSubmit = (data: ReferenceData) => {
    if (editingIndex !== null) {
      // Edit existing reference
      const newReferences = [...references];
      newReferences[editingIndex] = data;
      onUpdate(newReferences);
    } else {
      // Add new reference
      onUpdate([...references, data]);
    }
    
    form.reset();
    setIsDialogOpen(false);
    setEditingIndex(null);
  };

  const handleEdit = (index: number) => {
    const reference = references[index];
    form.reset(reference);
    setEditingIndex(index);
    setIsDialogOpen(true);
  };

  const handleRemove = (index: number) => {
    const newReferences = references.filter((_, i) => i !== index);
    onUpdate(newReferences);
  };

  const handleAddNew = () => {
    form.reset({
      fullName: "",
      company: "",
      designation: "",
      phone: "",
      email: "",
    });
    setEditingIndex(null);
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-4">
      {references.map((reference, index) => (
        <Card key={index} className="border border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-gray-900">Reference {index + 1}</h4>
              <div className="flex space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEdit(index)}
                >
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemove(index)}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">Name:</span>
                <span className="ml-2 text-gray-900">{reference.fullName}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Company:</span>
                <span className="ml-2 text-gray-900">{reference.company}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Position:</span>
                <span className="ml-2 text-gray-900">{reference.designation}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Phone:</span>
                <span className="ml-2 text-gray-900">{reference.phone}</span>
              </div>
              <div className="md:col-span-2">
                <span className="font-medium text-gray-700">Email:</span>
                <span className="ml-2 text-gray-900">{reference.email}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button 
            type="button" 
            variant="outline" 
            className="w-full border-2 border-dashed border-gray-300 p-4 hover:border-gray-400"
            onClick={handleAddNew}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add {references.length === 0 ? "Professional" : "Another"} Reference
          </Button>
        </DialogTrigger>
        
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingIndex !== null ? "Edit" : "Add"} Professional Reference
            </DialogTitle>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="company"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="designation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Position/Title</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input type="tel" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex justify-end space-x-3 pt-4">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {editingIndex !== null ? "Update" : "Save"} Reference
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
