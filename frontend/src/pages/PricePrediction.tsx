import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrendingUp, Calculator } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ChatBot from '@/components/layout/ChatBot';
import { getLists, getMeta, postPredict } from '@/lib/api';

type PredictOut = {
  prediction: number;
  range: string;
  lower: number;
  upper: number;
  price_category: string;
  price_per_sqm: number;
};

const AMENITIES = [
  'pool', 'terrace', 'balcony', 'garden', 'parking', 'air_conditioning',
  'elevator', 'furnished', 'security', 'fireplace', 'kitchen_equipped',
  'heating', 'hammam', 'concierge', 'duplex', 'high_standing',
  'new_construction', 'double_glazing'
] as const;

type AmenityKey = (typeof AMENITIES)[number];
type AmenityState = Record<AmenityKey, number>;

function prettyAmenity(k: string) {
  const label = k.replace(/_/g, ' ');
  return label.charAt(0).toUpperCase() + label.slice(1);
}
function formatMAD(n: number) {
  return `${Math.round(n).toLocaleString()} MAD`;
}

const PricePrediction = () => {
  const [locations, setLocations] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [meta, setMeta] = useState<any>(null);

  // form
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('');
  const [surface, setSurface] = useState<number>(100);
  const [rooms, setRooms] = useState<number>(3);
  const [baths, setBaths] = useState<number>(2);
  const [amenities, setAmenities] = useState<Partial<AmenityState>>({ parking: 1 });

  const [loadingLists, setLoadingLists] = useState<boolean>(true);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PredictOut | null>(null);
  const [error, setError] = useState<string | null>(null);

  // init lists + meta
  useEffect(() => {
    (async () => {
      try {
        setLoadingLists(true);
        const [lists, m] = await Promise.all([getLists(), getMeta()]);
        setLocations(lists?.locations ?? []);
        setCategories(lists?.categories ?? []);
        setMeta(m ?? null);
      } catch (e: any) {
        setError(e?.message || 'Failed to load lists/meta');
      } finally {
        setLoadingLists(false);
      }
    })();
  }, []);

  // defaults when lists loaded
  useEffect(() => {
    if (!location && locations.length) setLocation(locations[0]);
    if (!category && categories.length) setCategory(categories[0]);
  }, [locations, categories]); // eslint-disable-line react-hooks/exhaustive-deps

  const isFormValid = useMemo(() => {
    const okNums = Number.isFinite(surface) && surface > 0 && rooms >= 0 && baths >= 0;
    return !!location && !!category && okNums;
  }, [location, category, surface, rooms, baths]);

  const handlePredict = async () => {
    if (!isFormValid) {
      setError('Please complete the form with valid numbers.');
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const payload = {
        location,
        category_type: category,
        surface_area: Number(surface),
        total_rooms: Number(rooms),
        bathrooms: Number(baths),
        amenities: amenities as Record<string, number>,
      };
      const out = await postPredict(payload);
      setResult(out);
    } catch (e: any) {
      setError(e?.message || 'Prediction failed');
    } finally {
      setLoading(false);
    }
  };

  const kpi = useMemo(() => {
    if (!result) return [];
    return [
      { label: 'Estimated Price', value: formatMAD(result.prediction) },
      { label: 'Range', value: result.range },
      { label: 'Price / m²', value: `${Math.round(result.price_per_sqm).toLocaleString()} MAD/m²` },
      { label: 'Segment', value: result.price_category },
    ];
  }, [result]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <ChatBot />

      <section className="pt-24 pb-16 bg-gradient-to-br from-primary/5 to-accent/5">
        <div className="container-custom text-center">
          <h1 className="text-4xl md:text-6xl font-playfair font-bold text-primary mb-6">Price Prediction</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Get an instant estimate of your property's market value
          </p>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-custom max-w-6xl mx-auto grid md:grid-cols-2 gap-8">
          {/* FORM */}
          <Card className="p-8">
            <div className="space-y-6">
              <h2 className="text-2xl font-playfair font-bold">Property Details</h2>

              <div className="grid gap-4">
                {/* Location */}
                <Select value={location} onValueChange={(v) => { setLocation(v); setResult(null); }} disabled={loadingLists}>
                  <SelectTrigger>
                    <SelectValue placeholder={loadingLists ? 'Loading…' : 'Location'} />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map((loc) => (
                      <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Category */}
                <Select value={category} onValueChange={(v) => { setCategory(v); setResult(null); }} disabled={loadingLists}>
                  <SelectTrigger>
                    <SelectValue placeholder={loadingLists ? 'Loading…' : 'Property Type'} />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Numeric inputs */}
                <div className="grid grid-cols-3 gap-4">
                  <Input
                    type="number"
                    min={10}
                    value={surface}
                    onChange={(e) => setSurface(+e.target.value)}
                    placeholder="Surface (m²)"
                  />
                  <Input
                    type="number"
                    min={0}
                    value={rooms}
                    onChange={(e) => setRooms(+e.target.value)}
                    placeholder="Rooms"
                  />
                  <Input
                    type="number"
                    min={0}
                    value={baths}
                    onChange={(e) => setBaths(+e.target.value)}
                    placeholder="Bathrooms"
                  />
                </div>

                {/* Amenities grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {AMENITIES.map((k) => (
                    <label key={k} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={Boolean(amenities[k])}
                        onChange={(e) =>
                          setAmenities((a) => ({
                            ...(a || {}),
                            [k]: e.target.checked ? 1 : 0,
                          }))
                        }
                      />
                      <span className="capitalize">{prettyAmenity(k)}</span>
                    </label>
                  ))}
                </div>

                <Button
                  onClick={handlePredict}
                  className="w-full btn-primary"
                  disabled={loading || !isFormValid}
                >
                  <Calculator className="w-4 h-4 mr-2" />
                  {loading ? 'Predicting…' : 'Get Price Estimate'}
                </Button>

                {error && (
                  <div className="text-red-600 text-sm" role="alert" aria-live="polite">
                    {error}
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* RESULTS / METRICS */}
          <div className="space-y-6">
            <Card className="p-6">
              {result ? (
                <>
                  <h3 className="text-xl font-playfair font-semibold mb-4">Estimated Value</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {kpi.map((k) => (
                      <div key={k.label} className="rounded-xl border p-4">
                        <div className="text-xs uppercase text-muted-foreground">{k.label}</div>
                        <div className="text-2xl font-bold">{k.value}</div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center">
                  <TrendingUp className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">Enter property details to get your price estimate</p>
                </div>
              )}
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-2">Model Info</h3>
              {meta ? (
                <div className="text-sm grid grid-cols-2 gap-2">
                  <div>Trained: <b>{meta.trained_at}</b></div>
                  <div>R²: <b>{typeof meta.r2 === 'number' ? meta.r2.toFixed(3) : '-'}</b></div>
                  <div>CV R²: <b>{typeof meta.cv_r2_mean === 'number' ? meta.cv_r2_mean.toFixed(3) : '-'}{typeof meta.cv_r2_std === 'number' ? ` ± ${meta.cv_r2_std.toFixed(3)}` : ''}</b></div>
                  <div>MAE: <b>{typeof meta.mae === 'number' ? formatMAD(meta.mae) : '-'}</b></div>
                  <div>RMSE: <b>{typeof meta.rmse === 'number' ? formatMAD(meta.rmse) : '-'}</b></div>
                  <div>Features: <b>{meta.n_features}</b></div>
                </div>
              ) : (
                <div className="text-muted-foreground text-sm">Model metadata loading…</div>
              )}
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default PricePrediction;
