import axios from 'axios';
import { UazapiConfig, Message } from './types';

export class UazapiService {
  private config: UazapiConfig;

  constructor(config: UazapiConfig) {
    this.config = config;
  }

  private get client() {
    const baseUrl = this.config.baseUrl.replace(/\/$/, '');
    return axios.create({
      baseURL: baseUrl,
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
      // Evolution API can return an array or an object with an instances property
      const data = response.data;
      if (Array.isArray(data)) return data;
      if (data && Array.isArray(data.instances)) return data.instances;
      if (data && typeof data === 'object') return [data]; // Single instance case
      return [];
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
