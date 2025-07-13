import {
  EPaycoConfig,
  PsePaymentData,
  EPaycoResponse,
  EPaycoError,
} from '@/types/epayco';

const epayco = require('epayco-sdk-node');

export class EPaycoService {
  private config: EPaycoConfig;
  private epaycoClient: any;

  constructor() {
    this.config = this.getConfig();
    this.validateConfig();
    this.epaycoClient = epayco({
      apiKey: this.config.apiKey,
      privateKey: this.config.privateKey,
      lang: this.config.lang,
      test: this.config.test
    });
  }

  private getConfig(): EPaycoConfig {
    const apiKey = process.env.EPAYCO_PUBLIC_KEY;
    const privateKey = process.env.EPAYCO_PRIVATE_KEY;
    const isTest = process.env.EPAYCO_TEST === 'true';

    if (!apiKey || !privateKey) {
      throw new EPaycoError(
        'ePayco configuration is missing. Please check EPAYCO_PUBLIC_KEY and EPAYCO_PRIVATE_KEY environment variables.',
        500
      );
    }

    return {
      apiKey,
      privateKey,
      lang: 'ES',
      test: isTest,
      baseUrl: 'https://secure.epayco.co',
    };
  }

  private validateConfig(): void {
    if (!this.config.apiKey?.trim()) {
      throw new EPaycoError('ePayco API key is required', 500);
    }
    if (!this.config.privateKey?.trim()) {
      throw new EPaycoError('ePayco private key is required', 500);
    }
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.config.apiKey) {
      headers['Authorization'] = `Bearer ${this.config.apiKey}`;
      headers['X-API-KEY'] = this.config.apiKey;
    }

    if (this.config.privateKey) {
      headers['X-PRIVATE-KEY'] = this.config.privateKey;
    }

    return headers;
  }

  async createPsePayment(pseData: PsePaymentData): Promise<EPaycoResponse> {
    try {
      console.log(`[EPayco] Creating PSE payment for invoice: ${pseData.invoice}`);
      
      // Prepare data for the SDK
      const bankData = {
        bank: pseData.bank,
        invoice: pseData.invoice,
        description: pseData.description,
        value: pseData.value,
        tax: pseData.tax,
        tax_base: pseData.tax_base,
        currency: pseData.currency,
        type_person: pseData.type_person,
        doc_type: pseData.doc_type,
        doc_number: pseData.doc_number,
        name: pseData.name,
        last_name: pseData.last_name,
        email: pseData.email,
        country: pseData.country,
        cell_phone: pseData.cell_phone,
        ip: pseData.ip,
        url_response: pseData.url_response,
        url_confirmation: pseData.url_confirmation,
        method_confirmation: pseData.metodoconfirmacion,
        extra1: pseData.extra1,
        extra2: pseData.extra2,
        extra3: pseData.extra3,
        extra4: pseData.extra4,
        extra5: pseData.extra5,
        extra6: pseData.extra6
      };

      console.log('[EPayco] Sending bank data:', JSON.stringify(bankData, null, 2));

      const result = await this.epaycoClient.bank.create(bankData);
      
      console.log('[EPayco] Raw response received:', JSON.stringify(result, null, 2));

      if (!result) {
        throw new EPaycoError('No response received from ePayco', 500);
      }

      // Check for errors in the response
      if (result.error || result.errors) {
        const errorMessage = result.error || 
                           (result.errors && typeof result.errors === 'string' ? result.errors : 'Unknown error');
        console.error('[EPayco] PSE payment creation failed:', result);
        throw new EPaycoError(errorMessage, 400, result);
      }

      // Check if the response indicates success
      const success = result.success === true || result.estado === 'success' || result.urlbanco;
      
      if (!success) {
        console.error('[EPayco] PSE payment creation was not successful:', result);
        throw new EPaycoError(
          result.mensaje || result.message || 'PSE payment creation failed',
          400,
          result
        );
      }

      // Transform the response to our expected format
      const responseData: EPaycoResponse = {
        success: true,
        data: {
          urlbanco: result.urlbanco || result.url_banco || result.data?.urlbanco,
          ref_payco: result.ref_payco || result.referencia || result.data?.ref_payco,
          invoice: result.factura || result.invoice || pseData.invoice,
          description: result.descripcion || result.description || pseData.description,
          value: result.valor || result.value || pseData.value,
        }
      };

      if (!responseData.data?.urlbanco) {
        console.error('[EPayco] No payment URL returned:', result);
        throw new EPaycoError(
          'No payment URL returned from ePayco',
          500,
          result
        );
      }

      console.log(`[EPayco] PSE payment created successfully for invoice: ${pseData.invoice}`);
      
      return responseData;
    } catch (error) {
      if (error instanceof EPaycoError) {
        throw error;
      }

      console.error('[EPayco] Unexpected error creating PSE payment:', error);
      throw new EPaycoError(
        'Failed to create PSE payment due to unexpected error',
        500,
        error
      );
    }
  }

  async verifyPayment(transactionId: string): Promise<EPaycoResponse> {
    try {
      console.log(`[EPayco] Verifying payment for transaction: ${transactionId}`);
      
      const result = await this.epaycoClient.bank.get(transactionId);
      
      console.log('[EPayco] Verification response:', JSON.stringify(result, null, 2));

      if (!result) {
        throw new EPaycoError('No verification response received from ePayco', 500);
      }

      // Transform the response to our expected format
      const responseData: EPaycoResponse = {
        success: !result.error && !result.errors,
        data: result.data || result,
        error: result.error || result.errors || undefined,
        message: result.message || result.mensaje || undefined
      };

      return responseData;
    } catch (error) {
      if (error instanceof EPaycoError) {
        throw error;
      }

      console.error('[EPayco] Error verifying payment:', error);
      throw new EPaycoError(
        'Failed to verify payment',
        500,
        error
      );
    }
  }

  isConfigured(): boolean {
    try {
      this.validateConfig();
      return true;
    } catch {
      return false;
    }
  }

  getTestMode(): boolean {
    return this.config.test;
  }

  async getBanks(): Promise<any> {
    try {
      console.log('[EPayco] Getting available banks for PSE');
      
      const result = await this.epaycoClient.bank.getBanks();
      
      console.log('[EPayco] Banks response:', JSON.stringify(result, null, 2));

      return result;
    } catch (error) {
      console.error('[EPayco] Error getting banks:', error);
      throw new EPaycoError(
        'Failed to get available banks',
        500,
        error
      );
    }
  }
}