import { ref, computed, unref, watch, onMounted, onBeforeUnmount, type MaybeRef } from 'vue'
import { Client, type StompSubscription } from '@stomp/stompjs'

export interface OcpiCommandPayload {
  command_type: 'START_SESSION' | 'STOP_SESSION' | 'MeterValues' | string
  evse_uid?: string
  transactionId?: string
  isFullCharge?: number
  paymentMethod?: number
  plug?: number
  durations?: number
  totalKwh?: number
  totalPrice?: number
  actualKwh?: number
  duration?: number
  kwh?: number
  rate?: number
  remaining?: number
  soc?: number
  w?: number
  wh?: number
  [key: string]: any
}

export interface OcpiMeterValuesPayload {
  command_type: 'MeterValues'
  duration?: number
  kwh?: number
  rate?: number
  remaining?: number
  soc?: number
  transactionId?: string
  w?: number
  wh?: number
  voltage?: number
  current?: number
  [key: string]: any
}

export function useWebSocket(
  url?: string,
  options?: {
    topic?: string | MaybeRef<string | undefined>
    evseUid?: string | MaybeRef<string | undefined>
  }
) {
  const config = useRuntimeConfig()
  const rawWs = url || (config.public as any)?.webSocketUrl || 'qacltom.udaya-tech.com'
  const brokerURL = rawWs.startsWith('ws://') || rawWs.startsWith('wss://')
    ? rawWs
    : `wss://${rawWs}/OCPI/ws?username=`

  const data = ref<any>(null)
  const status = ref<'connecting' | 'open' | 'closed'>('closed')

  let client: Client | null = null
  let currentSubscription: StompSubscription | null = null
  const outboxQueue: Array<{ destination: string; payload: any }> = []

  const currentTopic = computed(() => {
    const customTopic = unref(options?.topic)
    if (customTopic && typeof customTopic === 'string' && customTopic.trim()) {
      return customTopic.trim()
    }
    const uid = unref(options?.evseUid)
    if (uid && typeof uid === 'string' && uid.trim() && uid.trim() !== 'undefined') {
      return `/topic/ocpi/commands/${uid.trim()}`
    }
    return ''
  })

  function subscribeToTopic(topic: string) {
    if (!client || !client.connected || !topic) return

    if (currentSubscription) {
      try {
        currentSubscription.unsubscribe()
      } catch (err) {
        console.warn('[WebSocket] Error unsubscribing:', err)
      }
      currentSubscription = null
    }

    try {
      currentSubscription = client.subscribe(topic, (frame) => {
        try {
          const parsed = JSON.parse(frame.body)
          data.value = parsed
          console.log('OCPI command received:', parsed)
        } catch {
          data.value = frame.body
          console.log('OCPI command received:', frame.body)
        }
      })

      console.log(
        '%c[WebSocket] 🟢 Subscribed to %c' + topic,
        'background: #38a169; color: white; font-weight: bold; padding: 2px 6px; border-radius: 4px;',
        'color: #805ad5; font-weight: bold;'
      )
    } catch (err) {
      console.error('[WebSocket] Failed to subscribe to ' + topic, err)
    }
  }

  function connect() {
    status.value = 'connecting'

    client = new Client({
      brokerURL,
      reconnectDelay: 3000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      debug: (msg: string) => {
        // Log STOMP protocol frames (similar to browser console output)
        if (!msg.includes('PING') && !msg.includes('PONG')) {
          console.debug('[STOMP]', msg)
        }
      },
      onConnect: (receipt) => {
        status.value = 'open'
        console.log(
          '%c[WebSocket] 🟢 CONNECTED',
          'background: #38a169; color: white; font-weight: bold; padding: 2px 6px; border-radius: 4px;',
          receipt
        )

        // Only subscribe if a valid topic is present
        if (currentTopic.value) {
          subscribeToTopic(currentTopic.value)
        }

        // Flush any queued messages
        while (outboxQueue.length > 0) {
          const item = outboxQueue.shift()
          if (item) {
            publish(item.destination, item.payload)
          }
        }
      },
      onDisconnect: () => {
        status.value = 'closed'
        currentSubscription = null
      },
      onStompError: (frame) => {
        console.error('STOMP broker error:', frame.headers['message'], frame.body)
      },
      onWebSocketClose: () => {
        status.value = 'closed'
        currentSubscription = null
      }
    })

    client.activate()
  }

  // React to dynamic topic changes
  watch(currentTopic, (newTopic, oldTopic) => {
    if (newTopic !== oldTopic && client?.connected) {
      if (currentSubscription) {
        currentSubscription.unsubscribe()
        currentSubscription = null
      }
      if (newTopic) {
        subscribeToTopic(newTopic)
      }
    }
  })

  function publish(destination: string, payload: any) {
    if (client && client.connected) {
      client.publish({
        destination,
        body: typeof payload === 'string' ? payload : JSON.stringify(payload),
        skipContentLengthHeader: false
      })
      console.log(`%c[STOMP 📤 Outbound to ${destination}]:`, 'color: #38a169; font-weight: bold;', payload)
    }
  }

  function send(payloadOrDestination: any, maybePayload?: any) {
    let destination = currentTopic.value
    let payload = payloadOrDestination

    if (typeof payloadOrDestination === 'string' && maybePayload !== undefined) {
      destination = payloadOrDestination
      payload = maybePayload
    } else if (payloadOrDestination && typeof payloadOrDestination === 'object') {
      if (payloadOrDestination.destination) {
        destination = payloadOrDestination.destination
      } else if (payloadOrDestination.evse_uid) {
        destination = `/topic/ocpi/commands/${payloadOrDestination.evse_uid}`
      }
    }

    if (!destination) {
      console.warn('[WebSocket] ⚠️ Cannot send message: destination is undefined or empty', payload)
      return
    }

    if (!client?.connected) {
      console.warn('[WebSocket] ⏳ Client not connected, buffering outbound message:', { destination, payload })
      outboxQueue.push({ destination, payload })
      return
    }

    publish(destination, payload)
  }

  function close() {
    if (currentSubscription) {
      try {
        currentSubscription.unsubscribe()
      } catch {}
      currentSubscription = null
    }
    if (client) {
      client.deactivate()
      client = null
    }
    status.value = 'closed'
  }

  onMounted(() => {
    connect()
  })

  onBeforeUnmount(() => {
    close()
  })

  return { data, status, send, close, client }
}

export { useWebSocket as useChargingSocket }