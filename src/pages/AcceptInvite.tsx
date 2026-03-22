import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { motion } from 'motion/react';
import { LayoutDashboard, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function AcceptInvite() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState('');

  useEffect(() => {
    const processInvite = async () => {
      if (!token) {
        setStatus('error');
        setError('No invite token provided.');
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        // Redirect to login with invite token
        navigate(`/login?invite=${token}`);
        return;
      }

      try {
        // Find the invite
        const { data: inviteData, error: inviteError } = await supabase
          .from('project_invites')
          .select('*')
          .eq('token', token)
          .single();

        if (inviteError || !inviteData) {
          setStatus('error');
          setError('Invalid or expired invite token.');
          return;
        }

        if (inviteData.accepted) {
          setStatus('error');
          setError('This invite has already been used.');
          return;
        }

        // Add user to project if project_id exists
        if (inviteData.project_id) {
          const { error: projectUserError } = await supabase
            .from('project_users')
            .insert([{
              project_id: inviteData.project_id,
              user_id: user.id,
              role: inviteData.role
            }]);
          
          if (projectUserError && projectUserError.code !== '23505') { // Ignore unique constraint violation
            throw projectUserError;
          }
        }

        // Mark invite as accepted
        const { error: updateInviteError } = await supabase
          .from('project_invites')
          .update({
            accepted: true,
            accepted_at: new Date().toISOString(),
            accepted_by: user.id
          })
          .eq('token', token);

        if (updateInviteError) throw updateInviteError;

        // Update user profile role if needed
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            role: inviteData.role === 'client' ? 'client' : 'developer'
          })
          .eq('id', user.id);

        if (profileError) throw profileError;

        setStatus('success');
        toast.success('Invite accepted! Welcome to the loop.');
        
        // Redirect after 3 seconds
        setTimeout(() => {
          if (inviteData.role === 'client' && inviteData.project_id) {
            navigate(`/portal/${inviteData.project_id}`);
          } else if (inviteData.project_id) {
            navigate(`/dashboard/projects/${inviteData.project_id}`);
          } else {
            navigate('/dashboard');
          }
        }, 3000);

      } catch (err) {
        console.error(err);
        setStatus('error');
        setError('An error occurred while accepting the invite.');
      }
    };

    processInvite();
  }, [token, navigate]);

  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#060714] p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-8 max-w-md w-full"
      >
        <div className="flex justify-center">
          <div className="w-20 h-20 bg-gradient-to-br from-[#4F46E5] to-[#7C3AED] rounded-2xl flex items-center justify-center shadow-2xl shadow-indigo-500/20">
            <LayoutDashboard className="text-white w-10 h-10" />
          </div>
        </div>

        {status === 'loading' && (
          <div className="space-y-4">
            <Loader2 className="animate-spin text-[#4F46E5] mx-auto" size={48} />
            <h2 className="text-2xl font-bold text-white">Accepting Invite...</h2>
            <p className="text-[var(--dark-grey)]">Please wait while we add you to the loop.</p>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-4">
            <CheckCircle2 className="text-emerald-500 mx-auto" size={48} />
            <h2 className="text-2xl font-bold text-white">Welcome Aboard!</h2>
            <p className="text-[var(--dark-grey)]">Invite accepted successfully. Redirecting you to the project...</p>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-4">
            <AlertCircle className="text-red-500 mx-auto" size={48} />
            <h2 className="text-2xl font-bold text-white">Oops!</h2>
            <p className="text-[var(--dark-grey)]">{error}</p>
            <button 
              onClick={() => navigate('/')}
              className="mt-4 px-6 py-2 bg-white/5 text-white rounded-lg hover:bg-white/10 transition-all font-medium"
            >
              Go to Dashboard
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
