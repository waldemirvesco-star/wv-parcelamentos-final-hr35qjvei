import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card'
import { Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import pb from '@/lib/pocketbase/client'

export default function ResetPassword() {
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const navigate = useNavigate()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!token) {
      toast({
        variant: 'destructive',
        title: 'Token inválido',
        description: 'O link de redefinição de senha é inválido ou expirou.',
      })
      return
    }

    if (password !== passwordConfirm) {
      toast({
        variant: 'destructive',
        title: 'Senhas não conferem',
        description: 'A nova senha e a confirmação devem ser iguais.',
      })
      return
    }

    if (password.length < 8) {
      toast({
        variant: 'destructive',
        title: 'Senha muito curta',
        description: 'A senha deve ter pelo menos 8 caracteres.',
      })
      return
    }

    setIsLoading(true)

    try {
      await pb.collection('users').confirmPasswordReset(token, password, passwordConfirm)
      toast({
        title: 'Senha alterada com sucesso',
        description: 'Sua senha foi redefinida. Você já pode fazer login com a nova senha.',
      })
      navigate('/')
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao redefinir senha',
        description: 'O token pode estar expirado ou inválido. Solicite uma nova redefinição.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <Card className="w-full max-w-md shadow-lg border-slate-200">
          <CardHeader className="space-y-2 text-center pb-6">
            <CardTitle className="text-2xl font-bold tracking-tight text-slate-900">
              Link Inválido
            </CardTitle>
            <CardDescription className="text-slate-500">
              O link de redefinição de senha está ausente ou inválido.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button asChild className="w-full bg-emerald-600 hover:bg-emerald-700">
              <Link to="/esqueci-senha">Solicitar novo link</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md shadow-lg border-slate-200">
        <CardHeader className="space-y-2 text-center pb-6">
          <CardTitle className="text-2xl font-bold tracking-tight text-slate-900">
            Nova Senha
          </CardTitle>
          <CardDescription className="text-slate-500">
            Crie uma nova senha para sua conta
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2 text-left">
              <Label htmlFor="password">Nova Senha</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-slate-50/50"
                minLength={8}
              />
            </div>
            <div className="space-y-2 text-left">
              <Label htmlFor="passwordConfirm">Confirmar Nova Senha</Label>
              <Input
                id="passwordConfirm"
                type="password"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                required
                className="bg-slate-50/50"
                minLength={8}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-700 transition-all"
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Redefinir Senha
            </Button>
            <div className="text-center text-sm">
              <Link to="/" className="text-slate-500 hover:text-slate-900 transition-colors">
                Voltar para o login
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
