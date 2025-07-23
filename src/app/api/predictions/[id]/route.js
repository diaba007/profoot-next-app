import { NextResponse } from 'next/server';
import connectDB from '../../../../lib/mongodb'; // Chemin ajusté pour src/lib
import Prediction from '../../../data/predictions'; // Chemin ajusté pour src/app/data/predictions.js
import { getServerSession } from 'next-auth'; // Importe getServerSession
import { authOptions } from '../../auth/[...nextauth]/route'; // Importe vos authOptions

// Gère les requêtes GET (récupérer un pronostic par ID)
export async function GET(request, { params }) {
  // Cette route est protégée pour les administrateurs.
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ message: 'Accès non autorisé. Seuls les admins peuvent accéder aux détails.' }, { status: 403 });
  }

  await connectDB();
  const { id } = params;
  try {
    const prediction = await Prediction.findById(id);
    if (!prediction) {
      return NextResponse.json({ message: 'Pronostic non trouvé.' }, { status: 404 });
    }
    return NextResponse.json(prediction, { status: 200 });
  } catch (error) {
    console.error(`Erreur GET /api/predictions/${id}:`, error);
    return NextResponse.json({ message: 'Erreur serveur lors de la récupération du pronostic.', error: error.message }, { status: 500 });
  }
}

// Gère les requêtes PUT (modifier un pronostic par ID)
export async function PUT(request, { params }) {
  // Protection de la route : Vérifie l'authentification et le rôle admin
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ message: 'Accès non autorisé. Seuls les admins peuvent modifier des pronostics.' }, { status: 403 });
  }

  await connectDB();
  const { id } = params;
  try {
    const body = await request.json();

    // Nettoyage des champs si le statut n'est pas "Terminé"
    if (body.status !== 'Terminé') {
      body.actualResult = null;
      body.outcome = null;
    }

    const updatedPrediction = await Prediction.findByIdAndUpdate(id, body, { new: true, runValidators: true });
    if (!updatedPrediction) {
      return NextResponse.json({ message: 'Pronostic non trouvé.' }, { status: 404 });
    }
    return NextResponse.json(updatedPrediction, { status: 200 });
  } catch (error) {
    console.error(`Erreur PUT /api/predictions/${id}:`, error);
    return NextResponse.json({ message: 'Erreur serveur lors de la mise à jour du pronostic.', error: error.message }, { status: 500 });
  }
}

// Gère les requêtes DELETE (supprimer un pronostic par ID)
export async function DELETE(request, { params }) {
  // Ligne de débogage pour forcer la recompilation et le log. Peut être retirée en production.
  console.log('Tentative de suppression de pronostic pour ID:', params.id); 

  // Protection de la route : Vérifie l'authentification et le rôle admin
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ message: 'Accès non autorisé. Seuls les admins peuvent supprimer des pronostics.' }, { status: 403 });
  }

  await connectDB();
  const { id } = params;
  try {
    const deletedPrediction = await Prediction.findByIdAndDelete(id);
    if (!deletedPrediction) {
      return NextResponse.json({ message: 'Pronostic non trouvé.' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Pronostic supprimé avec succès.' }, { status: 200 });
  } catch (error) {
    console.error(`Erreur DELETE /api/predictions/${id}:`, error);
    return NextResponse.json({ message: 'Erreur serveur lors de la suppression du pronostic.', error: error.message }, { status: 500 });
  }
}
