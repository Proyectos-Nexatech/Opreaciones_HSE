-- 1. Habilitamos la extensión pg_net (necesaria para hacer peticiones HTTP desde Postgres)
create extension if not exists "pg_net";

-- 2. Creamos la función que enviará la notificación a Resend usando pg_net
create or replace function public.notificar_nuevo_usuario()
returns trigger
security definer
as $$
declare
  -- REEMPLAZA ESTA CLAVE POR TU API KEY DE RESEND "re_..."
  resend_api_key text := 'TU_API_KEY_DE_RESEND'; 
  payload jsonb;
begin
  -- Construimos el payload (body en formato JSON) tal cual lo requiere Resend
  payload := jsonb_build_object(
    'from', 'Operaciones HSE <no-reply@nexatech.com.co>',
    'to', 'proyectos@nexatech.com.co',
    'subject', '💡 Nuevo Registro Pendiente - Operaciones HSE',
    'html', '<!DOCTYPE html>' ||
            '<html>' ||
            '<body style="margin: 0; padding: 0; background-color: #f4f7fb; font-family: ''Segoe UI'', Tahoma, Geneva, Verdana, sans-serif;">' ||
            '  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f4f7fb; padding: 40px 20px;">' ||
            '    <tr>' ||
            '      <td align="center">' ||
            '        <table width="100%" max-width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); max-width: 600px;">' ||
            '          <tr>' ||
            '            <td style="background-color: #3b82f6; padding: 30px; text-align: center;">' ||
            '              <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: 0.5px;">Operaciones HSE</h1>' ||
            '            </td>' ||
            '          </tr>' ||
            '          <tr>' ||
            '            <td style="padding: 40px 30px;">' ||
            '              <h2 style="color: #1e293b; margin-top: 0; margin-bottom: 20px; font-size: 20px;">Nuevo usuario registrado</h2>' ||
            '              <p style="color: #475569; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">' ||
            '                El siguiente correo acaba de registrarse en la plataforma y se encuentra a la espera de aprobación para poder acceder al sistema:' ||
            '              </p>' ||
            '              <div style="background-color: #f1f5f9; border-left: 4px solid #3b82f6; padding: 15px 20px; margin-bottom: 30px; border-radius: 0 8px 8px 0;">' ||
            '                <p style="margin: 0; color: #0f172a; font-size: 16px; font-weight: 600;">' || new.email || '</p>' ||
            '              </div>' ||
            '              <p style="color: #475569; font-size: 15px; line-height: 1.6; margin-bottom: 30px;">' ||
            '                Por favor, inicia sesión en el panel de administrador para asignarle un rol o rechazar su solicitud.' ||
            '              </p>' ||
            '              <div style="text-align: center;">' ||
            '                <a href="https://supabase.com/dashboard/project/rfrzeahbbeovqjlyhlfm/auth/users" style="display: inline-block; background-color: #3b82f6; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 6px; font-weight: 600; font-size: 15px;">Ir a Gestión de Usuarios</a>' ||
            '              </div>' ||
            '            </td>' ||
            '          </tr>' ||
            '          <tr>' ||
            '            <td style="background-color: #f8fafc; padding: 20px 30px; text-align: center; border-top: 1px solid #e2e8f0;">' ||
            '              <p style="color: #94a3b8; font-size: 13px; margin: 0;">Este es un mensaje automático del sistema. Por favor no responder.</p>' ||
            '            </td>' ||
            '          </tr>' ||
            '        </table>' ||
            '      </td>' ||
            '    </tr>' ||
            '  </table>' ||
            '</body>' ||
            '</html>'
  );

  -- Enviamos la petición POST de manera asíncrona mediante pg_net
  perform net.http_post(
      url:='https://api.resend.com/emails',
      headers:=jsonb_build_object(
        'Authorization', 'Bearer ' || resend_api_key, 
        'Content-Type', 'application/json'
      ),
      body:=payload
  );

  return new;
end;
$$ language plpgsql;

-- 3. Creamos un Trigger en Supabase para que llame la función automáticamente cada vez que alguien se registre.
-- Primero lo eliminamos si ya existe
drop trigger if exists al_registrar_usuario on auth.users;

create trigger al_registrar_usuario
after insert on auth.users
for each row execute function public.notificar_nuevo_usuario();
