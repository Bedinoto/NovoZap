import axios from 'axios';
import { UazapiConfig, Message } from '../types';

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
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json'
      }
    });
  }

  async sendMessage(to: string, text: string) {
    try {
      // Try with instance ID in URL (Standard Evolution API)
      const response = await this.client.post(`/message/sendText/${this.config.instanceId}`, {
        number: to,
        text: text,
        linkPreview: false
      });
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404 || error.response?.status === 405) {
        // Try without instance ID in URL (Some Uazapi versions)
        try {
          const response = await this.client.post(`/message/sendText`, {
            instance: this.config.instanceId,
            number: to,
            text: text,
            linkPreview: false
          });
          return response.data;
        } catch (innerError) {
          console.error('Error sending message via Uazapi (fallback):', innerError);
          throw innerError;
        }
      }
      console.error('Error sending message via Uazapi:', error);
      throw error;
    }
  }

  async fetchInstances() {
    const endpoints = [
      '/instance/fetchInstances', 
      '/instance/instances',
      '/instance/list',
      '/instance/listInstances',
      '/v1/instance/fetchInstances',
      '/v1/instance/instances'
    ];
    let lastError: any = null;

    for (const endpoint of endpoints) {
      try {
        const response = await this.client.get(endpoint);
        const data = response.data;
        
        // Normalize the response
        let instances = [];
        if (Array.isArray(data)) {
          instances = data;
        } else if (data && Array.isArray(data.instances)) {
          instances = data.instances;
        } else if (data && typeof data === 'object') {
          // Check if it's a single instance object
          if (data.instanceId || data.id || data.instanceName || data.name) {
            instances = [data];
          }
        }
        
        if (instances.length > 0 || response.status === 200) {
          return instances;
        }
      } catch (error: any) {
        lastError = error;
        // If it's not a 404, it might be a real error (like 401), so we stop and throw
        if (error.response?.status !== 404) {
          throw error;
        }
        // If it is a 404, we try the next endpoint
        continue;
      }
    }

    // If all endpoints failed with 404
    console.error('All instance fetch endpoints returned 404:', lastError);
    throw lastError;
  }

  async getInstanceStatus() {
    try {
      const response = await this.client.get(`/instance/connectionState/${this.config.instanceId}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404 || error.response?.status === 405) {
        try {
          const response = await this.client.get(`/instance/connectionState`, {
            params: { instance: this.config.instanceId }
          });
          return response.data;
        } catch (innerError) {
          console.error('Error checking instance status (fallback):', innerError);
          throw innerError;
        }
      }
      console.error('Error checking instance status:', error);
      throw error;
    }
  }

  async logoutInstance() {
    try {
      const response = await this.client.delete(`/instance/logout/${this.config.instanceId}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404 || error.response?.status === 405) {
        try {
          const response = await this.client.delete(`/instance/logout`, {
            params: { instance: this.config.instanceId }
          });
          return response.data;
        } catch (innerError) {
          console.error('Error logging out instance (fallback):', innerError);
          throw innerError;
        }
      }
      console.error('Error logging out instance:', error);
      throw error;
    }
  }
}
