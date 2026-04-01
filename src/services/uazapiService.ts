import axios from 'axios';
import { UazapiConfig, Message } from './types';

export class UazapiService {
  private config: UazapiConfig;

  constructor(config: UazapiConfig) {
    this.config = config;
  }

  private get client() {
    return axios.create({
      baseURL: this.config.baseUrl,
      headers: {
        'apikey': this.config.apiKey,
        'Content-Type': 'application/json'
      }
    });
  }

  async sendMessage(to: string, text: string) {
    try {
      // Standard Evolution API / Uazapi Cloud endpoint
      const response = await this.client.post(`/message/sendText/${this.config.instanceId}`, {
        number: to,
        text: text,
        linkPreview: false
      });
      return response.data;
    } catch (error) {
      console.error('Error sending message via Uazapi:', error);
      throw error;
    }
  }

  async fetchInstances() {
    try {
      const response = await this.client.get('/instance/fetchInstances');
      return response.data;
    } catch (error) {
      console.error('Error fetching instances:', error);
      throw error;
    }
  }

  async getInstanceStatus() {
    try {
      const response = await this.client.get(`/instance/connectionState/${this.config.instanceId}`);
      return response.data;
    } catch (error) {
      console.error('Error checking instance status:', error);
      throw error;
    }
  }

  async logoutInstance() {
    try {
      const response = await this.client.delete(`/instance/logout/${this.config.instanceId}`);
      return response.data;
    } catch (error) {
      console.error('Error logging out instance:', error);
      throw error;
    }
  }
}
