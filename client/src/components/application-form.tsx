import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/use-language";
import { apiRequest } from "@/lib/queryClient";
import { insertUserSchema, insertLoanApplicationSchema } from "@shared/schema";
import { z } from "zod";
import { Building, Mail, Phone, Calendar, Users, FileText, DollarSign, Clock } from "lucide-react";

interface ApplicationFormProps {
  onNext: (data: any) => void;
  initialData?: any;
}

// Combined schema for business registration and loan application
const applicationSchema = z.object({
  // Business Information
  businessName: z.string().min(2, "Business name must be at least 2 characters"),
  businessType: z.string().min(1, "Please select a business type"),
  contactPerson: z.string().min(2, "Contact person name is required"),
  email: z.string().email("Please enter a valid email address"),
  phoneNumber: z.string().min(10, "Please enter a valid phone number"),
  establishedYear: z.number().min(1950).max(new Date().getFullYear()),
  employeeCount: z.number().min(1).max(10000),
  monthlyRevenue: z.string().min(1, "Monthly revenue is required"),
  tradeLicense: z.string().optional(),
  
  // Loan Details
  requestedAmount: z.string().min(1, "Requested amount is required"),
  currency: z.string().default("AED"),
  loanType: z.string().min(1, "Please select a loan type"),
  purpose: z.string().min(10, "Please provide a detailed purpose (minimum 10 characters)"),
  repaymentTerm: z.number().min(3).max(60),
  collateral: z.string().optional(),
});

type ApplicationFormData = z.infer<typeof applicationSchema>;

export default function ApplicationForm({ onNext, initialData }: ApplicationFormProps) {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isRTL = language === 'ar';

  const form = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      businessName: initialData?.businessName || "",
      businessType: initialData?.businessType || "",
      contactPerson: initialData?.contactPerson || "",
      email: initialData?.email || "",
      phoneNumber: initialData?.phoneNumber || "",
      establishedYear: initialData?.establishedYear || new Date().getFullYear() - 5,
      employeeCount: initialData?.employeeCount || 1,
      monthlyRevenue: initialData?.monthlyRevenue || "",
      tradeLicense: initialData?.tradeLicense || "",
      requestedAmount: initialData?.requestedAmount || "",
      currency: initialData?.currency || "AED",
      loanType: initialData?.loanType || "",
      purpose: initialData?.purpose || "",
      repaymentTerm: initialData?.repaymentTerm || 12,
      collateral: initialData?.collateral || "",
    },
  });

  const createUserMutation = useMutation({
    mutationFn: async (userData: any) => {
      const response = await apiRequest('POST', '/api/users/register', userData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
    },
  });

  const createApplicationMutation = useMutation({
    mutationFn: async (applicationData: any) => {
      const response = await apiRequest('POST', '/api/loan-applications', applicationData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/loan-applications'] });
    },
  });

  const onSubmit = async (data: ApplicationFormData) => {
    setIsSubmitting(true);
    
    try {
      // First create/register the user
      const userData = {
        businessName: data.businessName,
        businessType: data.businessType,
        contactPerson: data.contactPerson,
        email: data.email,
        phoneNumber: data.phoneNumber,
        establishedYear: data.establishedYear,
        employeeCount: data.employeeCount,
        monthlyRevenue: data.monthlyRevenue,
        tradeLicense: data.tradeLicense,
        password: "temp-password", // In real implementation, this would be handled properly
        preferredLanguage: language,
      };

      const user = await createUserMutation.mutateAsync(userData);

      // Then create the loan application
      const applicationData = {
        userId: user.id,
        loanType: data.loanType,
        requestedAmount: data.requestedAmount,
        currency: data.currency,
        purpose: data.purpose,
        repaymentTerm: data.repaymentTerm,
        documents: null,
      };

      const application = await createApplicationMutation.mutateAsync(applicationData);

      toast({
        title: t('applicationSubmitted'),
        description: t('applicationReceivedDescription'),
      });

      // Pass the combined data to the next step
      onNext({
        user,
        application,
        formData: data,
      });

    } catch (error) {
      console.error('Application submission failed:', error);
      toast({
        title: "Application Failed",
        description: "There was an error submitting your application. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`space-y-6 ${isRTL ? 'rtl' : ''}`}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="w-6 h-6" />
            {t('businessInfo')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="businessName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Building className="w-4 h-4" />
                        {t('businessName')}
                      </FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder={t('enterBusinessName')}
                          className="focus:ring-uae-blue focus:border-uae-blue"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="businessType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('businessType')}</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="focus:ring-uae-blue focus:border-uae-blue">
                            <SelectValue placeholder={t('selectBusinessType')} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="trading">{t('trading')}</SelectItem>
                          <SelectItem value="manufacturing">{t('manufacturing')}</SelectItem>
                          <SelectItem value="services">{t('services')}</SelectItem>
                          <SelectItem value="technology">{t('technology')}</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="contactPerson"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        {t('contactPerson')}
                      </FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          className="focus:ring-uae-blue focus:border-uae-blue"
                        />
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
                      <FormLabel className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        {t('email')}
                      </FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="email"
                          className="focus:ring-uae-blue focus:border-uae-blue"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        {t('phoneNumber')}
                      </FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="tel"
                          className="focus:ring-uae-blue focus:border-uae-blue"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="establishedYear"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {t('establishedYear')}
                      </FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="number"
                          min="1950"
                          max={new Date().getFullYear()}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                          className="focus:ring-uae-blue focus:border-uae-blue"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="employeeCount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        {t('employeeCount')}
                      </FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="number"
                          min="1"
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                          className="focus:ring-uae-blue focus:border-uae-blue"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="monthlyRevenue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4" />
                        {t('monthlyRevenue')} (AED)
                      </FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="number"
                          min="0"
                          className="focus:ring-uae-blue focus:border-uae-blue"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tradeLicense"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        {t('tradeLicense')}
                      </FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          className="focus:ring-uae-blue focus:border-uae-blue"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Loan Details Section */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  {t('loanDetails')}
                </h3>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="requestedAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('requestedAmount')}</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="number"
                            min="10000"
                            max="10000000"
                            className="focus:ring-uae-blue focus:border-uae-blue"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="loanType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Loan Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="focus:ring-uae-blue focus:border-uae-blue">
                              <SelectValue placeholder="Select loan type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="working_capital">Working Capital</SelectItem>
                            <SelectItem value="supply_chain">Supply Chain Finance</SelectItem>
                            <SelectItem value="community">Community Lending</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="repaymentTerm"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          {t('repaymentTerm')}
                        </FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="number"
                            min="3"
                            max="60"
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                            className="focus:ring-uae-blue focus:border-uae-blue"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="currency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('currency')}</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="focus:ring-uae-blue focus:border-uae-blue">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="AED">AED - UAE Dirham</SelectItem>
                            <SelectItem value="USD">USD - US Dollar</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="purpose"
                  render={({ field }) => (
                    <FormItem className="mt-4">
                      <FormLabel>{t('purpose')}</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          placeholder="Describe how you plan to use the funding..."
                          rows={4}
                          className="focus:ring-uae-blue focus:border-uae-blue"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="collateral"
                  render={({ field }) => (
                    <FormItem className="mt-4">
                      <FormLabel>{t('collateral')}</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          placeholder="Describe any collateral you can provide (optional)..."
                          rows={2}
                          className="focus:ring-uae-blue focus:border-uae-blue"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end">
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="bg-uae-blue hover:bg-blue-700 px-8"
                >
                  {isSubmitting ? t('submitting') : t('next')}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
