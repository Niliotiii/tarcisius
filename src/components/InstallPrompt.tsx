import { useEffect, useState } from 'react'
import {
  shouldOfferIOSInstallPrompt,
  shouldOfferSwitchToSafariPrompt,
} from '@/lib/pwa'
import { getInstallPromptDismissed, setInstallPromptDismissed } from '@/lib/storage'

type Variant = 'install' | 'switch-to-safari' | 'android'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function InstallPrompt() {
  const [variant, setVariant] = useState<Variant | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [androidPrompt, setAndroidPrompt] = useState<BeforeInstallPromptEvent | null>(null)

  useEffect(() => {
    const iosVariant: Variant | null = shouldOfferIOSInstallPrompt()
      ? 'install'
      : shouldOfferSwitchToSafariPrompt()
        ? 'switch-to-safari'
        : null

    if (iosVariant) {
      if (!getInstallPromptDismissed()) setVariant(iosVariant)
      return
    }

    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault()
      if (getInstallPromptDismissed()) return
      setAndroidPrompt(event as BeforeInstallPromptEvent)
      setVariant('android')
    }
    const onAppInstalled = () => {
      setVariant(null)
      setAndroidPrompt(null)
    }

    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt)
    window.addEventListener('appinstalled', onAppInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt)
      window.removeEventListener('appinstalled', onAppInstalled)
    }
  }, [])

  const dismiss = () => {
    setVariant(null)
    setInstallPromptDismissed()
  }

  const handleBannerAction = async () => {
    if (variant === 'android' && androidPrompt) {
      await androidPrompt.prompt()
      await androidPrompt.userChoice
      setAndroidPrompt(null)
      setVariant(null)
      return
    }
    setModalOpen(true)
  }

  if (!variant) return null

  return (
    <>
      <div className="animate-banner-drop-in fixed inset-x-4 bottom-4 z-40 flex items-center gap-3 rounded-2xl border border-alba/10 bg-sanctum p-3 shadow-lg sm:inset-x-auto sm:right-4 sm:w-96">
        <span className="text-xl" aria-hidden>
          {variant === 'switch-to-safari' ? '🧭' : '📲'}
        </span>
        <p className="flex-1 text-sm text-alba">
          {variant === 'install'
            ? 'Instale o Tarcisius na tela de início do seu iPhone'
            : variant === 'switch-to-safari'
              ? 'Abra este link no Safari para instalar o Tarcisius como app'
              : 'Instale o Tarcisius como app no seu celular'}
        </p>
        <button
          type="button"
          onClick={handleBannerAction}
          className="shrink-0 text-sm font-bold text-gold-dim hover:text-gold"
        >
          {variant === 'install' ? 'Como instalar' : variant === 'switch-to-safari' ? 'Como fazer' : 'Instalar'}
        </button>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Fechar aviso"
          className="shrink-0 text-alba-muted hover:text-alba"
        >
          ✕
        </button>
      </div>

      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="animate-halo-in w-full max-w-sm rounded-2xl bg-sanctum p-6 text-alba shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {variant === 'install' ? (
              <>
                <h2 className="font-fraunces text-lg font-semibold">Adicionar à tela de início</h2>
                <ol className="mt-4 space-y-3 text-sm">
                  <li className="flex items-start gap-3">
                    <span aria-hidden>⬆️</span>
                    <span>
                      Toque no ícone de <strong>Compartilhar</strong> na barra do Safari
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span aria-hidden>➕</span>
                    <span>
                      Role a lista e toque em <strong>"Adicionar à Tela de Início"</strong>
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span aria-hidden>✅</span>
                    <span>
                      Toque em <strong>"Adicionar"</strong> — pronto, o Tarcisius vira um app na sua tela
                    </span>
                  </li>
                </ol>
              </>
            ) : (
              <>
                <h2 className="font-fraunces text-lg font-semibold">Use o Safari para instalar</h2>
                <p className="mt-3 text-sm">
                  No iPhone, apenas o <strong>Safari</strong> consegue instalar o Tarcisius como app — outros
                  navegadores (Chrome, Firefox etc.) não têm essa opção.
                </p>
                <ol className="mt-4 space-y-3 text-sm">
                  <li className="flex items-start gap-3">
                    <span aria-hidden>⋯</span>
                    <span>
                      Toque no menu <strong>•••</strong> (ou no ícone de compartilhar) deste navegador
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span aria-hidden>🧭</span>
                    <span>
                      Escolha <strong>"Abrir no Safari"</strong>
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span aria-hidden>⬆️</span>
                    <span>
                      No Safari, toque em <strong>Compartilhar</strong> → <strong>"Adicionar à Tela de Início"</strong>
                    </span>
                  </li>
                </ol>
              </>
            )}

            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="mt-6 w-full rounded-xl bg-alba py-3 text-sm font-semibold text-sanctum"
            >
              Entendi
            </button>
          </div>
        </div>
      )}
    </>
  )
}
