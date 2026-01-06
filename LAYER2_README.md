# Beckn Protocol Layer 2 Configuration

## Overview

This Layer 2 configuration provides the network infrastructure for the Beckn Protocol implementation. It includes service discovery, message routing, monitoring, and security services that enable decentralized commerce across multiple BPPs (Beckn Provider Platforms).

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    BECKN LAYER 2 NETWORK                        │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                   BECKN GATEWAY (Port 5555)                     │
│              Load Balancing & Rate Limiting                      │
└─────┬──────────────┬──────────────┬──────────────┬─────────────┘
      │              │              │              │
      ▼              ▼              ▼              ▼
┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐
│Registry  │  │ Message  │  │ Monitor  │  │   Redis      │
│Service   │  │ Broker   │  │ Service  │  │   Cache      │
│ :8090    │  │ :8091    │  │ :8092    │  │   :6379      │
└──────────┘  └──────────┘  └──────────┘  └──────────────┘
      │              │              │              │
      └──────────────┴──────────────┴──────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │   PostgreSQL     │
                    │   Database       │
                    │     :5433        │
                    └──────────────────┘
```

## Components

### 1. Beckn Gateway (Port 5555)
- **Purpose**: Entry point for all Beckn protocol requests
- **Features**:
  - Load balancing across BAP instances
  - Rate limiting (100 requests/minute per IP)
  - Request routing based on endpoints
  - Health checks and monitoring
  - Security headers and CORS handling

### 2. Registry Service (Port 8090)
- **Purpose**: Service discovery and participant registration
- **Features**:
  - BAP/BPP registration and discovery
  - Network topology management
  - Capability-based routing
  - Geographic coverage tracking
  - Certificate management

### 3. Message Broker (Port 8091)
- **Purpose**: Asynchronous message handling and queuing
- **Features**:
  - Message queuing for high-volume requests
  - Request/response correlation
  - Dead letter queue handling
  - Message persistence and replay
  - Load distribution

### 4. Monitor Service (Port 8092)
- **Purpose**: Network monitoring and observability
- **Features**:
  - Health monitoring of all participants
  - Performance metrics collection
  - SLA tracking and alerting
  - Network topology visualization
  - Prometheus metrics export

### 5. Redis Cache (Port 6379)
- **Purpose**: High-performance caching and session storage
- **Features**:
  - Search result caching
  - Session management
  - Rate limiting counters
  - Message queue backend
  - Real-time data storage

### 6. PostgreSQL Database (Port 5433)
- **Purpose**: Persistent storage for network metadata
- **Features**:
  - Participant registry
  - Message audit logs
  - Health check history
  - Network metrics storage
  - Certificate management

## Configuration Files

### Core Configuration
- `beckn-layer2-config.yml` - Main Layer 2 configuration
- `docker-compose.layer2.yml` - Infrastructure deployment
- `database/layer2-setup.sql` - Database schema

### Service Configuration
- `config/nginx.conf` - Gateway configuration
- `config/redis.conf` - Cache configuration  
- `config/prometheus.yml` - Metrics collection

## Quick Start

### Prerequisites
- Docker Desktop installed and running
- Docker Compose v2.0+
- 8GB+ RAM available
- Ports 5555, 6379, 8090-8092, 9000, 9090, 3001, 16686 available

### 1. Start Layer 2 Infrastructure
```bash
# Windows
scripts\start-layer2.bat

# Linux/Mac
docker compose -f docker-compose.layer2.yml up -d
```

### 2. Verify Services
```bash
# Check all services are running
docker compose -f docker-compose.layer2.yml ps

# Check service health
curl http://localhost:5555/health
curl http://localhost:8090/health
curl http://localhost:8091/health
curl http://localhost:8092/health
```

### 3. Access Monitoring
- **Prometheus**: http://localhost:9090
- **Grafana**: http://localhost:3001 (admin/admin123)
- **Jaeger**: http://localhost:16686

## Service Endpoints

### Beckn Gateway (5555)
```
GET  /health              - Gateway health check
POST /beckn/*             - Beckn protocol endpoints
POST /api/*               - API endpoints
GET  /registry/*          - Registry service proxy
GET  /monitor/*           - Monitor service proxy
GET  /metrics             - Prometheus metrics
```

### Registry Service (8090)
```
GET  /health              - Service health
GET  /participants        - List all participants
POST /participants        - Register new participant
GET  /participants/{id}   - Get participant details
PUT  /participants/{id}   - Update participant
DELETE /participants/{id} - Deregister participant
GET  /routes              - Get routing rules
POST /routes              - Create routing rule
```

### Message Broker (8091)
```
GET  /health              - Service health
POST /messages            - Send message
GET  /messages/{id}       - Get message status
GET  /queues              - Queue statistics
POST /queues/{name}/purge - Purge queue
```

### Monitor Service (8092)
```
GET  /health              - Service health
GET  /metrics             - Prometheus metrics
GET  /participants/health - All participant health
GET  /network/topology    - Network topology
GET  /alerts              - Active alerts
POST /alerts              - Create alert rule
```

## Database Schema

### Key Tables
```sql
-- Network participants (BAPs, BPPs)
network_participants (
    participant_id, participant_name, participant_type,
    domain, category, subcategory,
    host, port, base_url, public_url,
    status, supported_actions, coverage_areas
)

-- Message tracking and audit
message_logs (
    message_id, transaction_id, action, domain,
    sender_id, receiver_id, message_body,
    status, sent_at, response_time_ms
)

-- Health monitoring
health_checks (
    participant_id, status, response_time_ms,
    health_data, checked_at
)

-- Network routing rules
routing_rules (
    domain, category, subcategory,
    target_participants, priority, enabled
)
```

## Monitoring & Observability

### Metrics Collection
- **Request Rate**: Requests per second by endpoint
- **Response Time**: P50, P95, P99 latencies
- **Error Rate**: 4xx/5xx error percentages
- **Participant Health**: Availability and response times
- **Queue Depth**: Message queue sizes and processing rates

### Dashboards
- **Network Overview**: Participant status and topology
- **Performance Metrics**: Response times and throughput
- **Error Tracking**: Failed requests and error rates
- **Capacity Planning**: Resource utilization trends

### Alerting Rules
- Participant down for >5 minutes
- Response time >2 seconds for >1 minute
- Error rate >5% for >2 minutes
- Queue depth >1000 messages
- Memory/CPU usage >80%

## Security Features

### Network Security
- **Rate Limiting**: 100 requests/minute per IP
- **DDoS Protection**: Burst limiting and IP blocking
- **CORS Policy**: Controlled cross-origin access
- **Security Headers**: XSS, CSRF, and clickjacking protection

### Data Security
- **Encryption at Rest**: AES-256-GCM for database
- **Encryption in Transit**: TLS 1.3 for all communications
- **Certificate Management**: Automated cert rotation
- **Access Control**: Role-based participant access

### Audit & Compliance
- **Request Logging**: All API calls logged
- **Message Audit**: Complete message trail
- **Data Retention**: 7-year retention policy
- **GDPR Compliance**: Data anonymization support

## Performance Tuning

### Redis Configuration
```yaml
# Memory optimization
maxmemory: 256mb
maxmemory-policy: allkeys-lru

# Persistence
save: 900 1, 300 10, 60 10000
appendonly: yes
appendfsync: everysec
```

### PostgreSQL Tuning
```sql
-- Connection pooling
max_connections = 100
shared_buffers = 256MB
effective_cache_size = 1GB

-- Query optimization
work_mem = 4MB
maintenance_work_mem = 64MB
```

### Nginx Optimization
```nginx
# Worker processes
worker_processes auto;
worker_connections 1024;

# Keepalive
keepalive_timeout 65;
keepalive_requests 100;

# Buffering
proxy_buffering on;
proxy_buffer_size 4k;
proxy_buffers 8 4k;
```

## Troubleshooting

### Common Issues

#### Services Not Starting
```bash
# Check Docker status
docker --version
docker compose version

# Check port conflicts
netstat -an | findstr :5555
netstat -an | findstr :6379

# View service logs
docker compose -f docker-compose.layer2.yml logs beckn-gateway
docker compose -f docker-compose.layer2.yml logs redis
```

#### High Memory Usage
```bash
# Check container resource usage
docker stats

# Restart specific service
docker compose -f docker-compose.layer2.yml restart redis

# Scale down if needed
docker compose -f docker-compose.layer2.yml scale beckn-registry=1
```

#### Network Connectivity Issues
```bash
# Test internal network
docker network ls
docker network inspect beckn-layer2-network

# Test service connectivity
docker exec beckn-gateway wget -qO- http://beckn-registry:8090/health
```

### Performance Issues
```bash
# Monitor Redis performance
docker exec beckn-redis redis-cli info stats
docker exec beckn-redis redis-cli slowlog get 10

# Check PostgreSQL performance
docker exec beckn-postgres psql -U postgres -d beckn_registry -c "SELECT * FROM pg_stat_activity;"

# Monitor Nginx access logs
docker logs beckn-gateway | tail -f
```

## Scaling Considerations

### Horizontal Scaling
- **Multiple Gateway Instances**: Load balancer in front
- **Registry Clustering**: Master-slave configuration
- **Database Replication**: Read replicas for queries
- **Redis Clustering**: Sharded cache deployment

### Vertical Scaling
- **Memory Allocation**: Increase container memory limits
- **CPU Resources**: Adjust CPU limits and requests
- **Storage**: Expand volume sizes for databases
- **Network**: Optimize buffer sizes and timeouts

## Production Deployment

### Environment Variables
```bash
# Production settings
NODE_ENV=production
LOG_LEVEL=warn
REDIS_URL=redis://redis-cluster:6379
DB_HOST=postgres-primary
DB_REPLICA_HOST=postgres-replica

# Security
TLS_ENABLED=true
CERT_PATH=/etc/ssl/certs
KEY_PATH=/etc/ssl/private
```

### Health Checks
```yaml
# Docker Compose health checks
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost/health"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 40s
```

### Backup Strategy
```bash
# Database backup
docker exec beckn-postgres pg_dump -U postgres beckn_registry > backup.sql

# Redis backup
docker exec beckn-redis redis-cli BGSAVE

# Configuration backup
tar -czf config-backup.tar.gz config/ beckn-layer2-config.yml
```

## Integration with Application Layer

### BAP Integration
```javascript
// BAP service configuration
const becknConfig = {
  gatewayUrl: 'http://localhost:5555',
  registryUrl: 'http://localhost:8090',
  participantId: 'travel-discovery-bap.beckn.org',
  // ... other config
};
```

### BPP Registration
```javascript
// Register BPP with Layer 2
const registration = {
  participant_id: 'flights-bpp.beckn.org',
  participant_name: 'Flights Provider',
  participant_type: 'BPP',
  domain: 'mobility',
  base_url: 'http://localhost:7001',
  supported_actions: ['search', 'select', 'init', 'confirm']
};
```

## Conclusion

This Layer 2 configuration provides a robust, scalable foundation for Beckn protocol networks. It handles service discovery, message routing, monitoring, and security, enabling seamless communication between BAPs and BPPs in a decentralized commerce ecosystem.

For production deployments, consider additional security hardening, performance optimization, and disaster recovery planning based on your specific requirements.