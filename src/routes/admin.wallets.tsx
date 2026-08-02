import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { getCryptoWallets, addAdminWallet, updateAdminWallet, deleteAdminWallet } from "@/server-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Wallet, Plus, Edit2, Trash2, CheckCircle, XCircle } from "lucide-react";

export const Route = createFileRoute("/admin/wallets")({
  component: AdminWallets,
});

function AdminWallets() {
  const [wallets, setWallets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [network, setNetwork] = useState("");
  const [address, setAddress] = useState("");
  const [isActive, setIsActive] = useState(true);
  
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  const loadWallets = async () => {
    setIsLoading(true);
    try {
      const data = await getCryptoWallets();
      setWallets(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadWallets();
  }, []);

  const resetForm = () => {
    setNetwork("");
    setAddress("");
    setIsActive(true);
    setEditingId(null);
    setIsAdding(false);
    setError("");
  };

  const handleEdit = (w: any) => {
    setNetwork(w.network);
    setAddress(w.address);
    setIsActive(w.isActive);
    setEditingId(w.id);
    setIsAdding(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPending(true);
    setError("");
    try {
      if (editingId) {
        await updateAdminWallet({ data: { id: editingId, network, address, isActive } });
      } else {
        await addAdminWallet({ data: { network, address } });
      }
      resetForm();
      await loadWallets();
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setPending(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this wallet?")) return;
    try {
      await deleteAdminWallet({ data: { id } });
      await loadWallets();
    } catch (err) {
      console.error("Failed to delete", err);
    }
  };

  return (
    <DashboardLayout admin title="Crypto Wallets">
      <div className="flex items-center justify-between mt-2 mb-6">
        <p className="text-muted-foreground">Manage the deposit crypto wallet addresses for investment plans.</p>
        {!isAdding && (
          <Button onClick={() => setIsAdding(true)} className="bg-gold text-navy hover:brightness-110">
            <Plus className="mr-2 h-4 w-4" /> Add Wallet
          </Button>
        )}
      </div>

      {isAdding && (
        <Card className="mb-8 border-gold/50 bg-gold/5">
          <CardHeader>
            <CardTitle>{editingId ? "Edit Wallet" : "Add New Wallet"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4 max-w-xl">
              <div>
                <label className="text-sm font-medium">Network (e.g. Bitcoin, ERC20, TRC20)</label>
                <input
                  required
                  value={network}
                  onChange={(e) => setNetwork(e.target.value)}
                  className="mt-1 w-full rounded-md border px-3 py-2 bg-white"
                  placeholder="Bitcoin"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Wallet Address</label>
                <input
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="mt-1 w-full rounded-md border px-3 py-2 bg-white"
                  placeholder="bc1..."
                />
              </div>
              {editingId && (
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="rounded border-gray-300 text-gold focus:ring-gold"
                  />
                  <label htmlFor="isActive" className="text-sm font-medium">Active (Visible to users)</label>
                </div>
              )}
              {error && <p className="text-red-500 text-sm font-medium">{error}</p>}
              <div className="flex gap-3">
                <Button disabled={pending} type="submit" className="bg-navy text-white hover:bg-navy/90">
                  {pending ? "Saving..." : "Save Wallet"}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {wallets.length === 0 ? (
            <div className="col-span-full py-8 text-center bg-slate-50 rounded-xl border border-dashed">
              <Wallet className="mx-auto h-8 w-8 text-slate-300 mb-2" />
              <p className="text-slate-500 font-medium">No crypto wallets configured.</p>
            </div>
          ) : (
            wallets.map((w) => (
              <Card key={w.id} className={!w.isActive ? "opacity-60 grayscale" : ""}>
                <CardHeader className="flex flex-row items-start justify-between pb-2">
                  <div>
                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                      <Wallet className="h-4 w-4 text-gold" />
                      {w.network}
                    </CardTitle>
                    <div className="mt-1 flex items-center gap-1.5 text-xs font-medium">
                      {w.isActive ? (
                        <span className="flex items-center text-emerald-600"><CheckCircle className="mr-1 h-3 w-3" /> Active</span>
                      ) : (
                        <span className="flex items-center text-slate-500"><XCircle className="mr-1 h-3 w-3" /> Inactive</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(w)}>
                      <Edit2 className="h-4 w-4 text-slate-500 hover:text-navy" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(w.id)}>
                      <Trash2 className="h-4 w-4 text-red-400 hover:text-red-600" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm font-mono bg-slate-100 p-2 rounded break-all">{w.address}</p>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </DashboardLayout>
  );
}
