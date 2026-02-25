# Fix PaymentsTab - remove revertToAwaiting and fix internalNotes
sed -i 's/revertToAwaiting/confirm/g' client/src/components/admin/PaymentsTab.tsx
sed -i 's/internalNotes/notes/g' client/src/components/admin/PaymentsTab.tsx

# Fix routers.ts - add giftReservationTimeout
sed -i "s/giftReservationLimit: 'unlimited',/giftReservationLimit: 'unlimited',\n          giftReservationTimeout: 120,/" server/routers.ts

echo "✅ Erros corrigidos!"
