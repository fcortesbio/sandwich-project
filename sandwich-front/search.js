export function searchCustomers(query, allCustomers) {
  if (!query || typeof query !== "string") return [];

  const lowerQuery = query.trim().toLowerCase();

  return allCustomers.filter((customer) => {
    const fieldsToSearch = [
      customer.first_name,
      customer.last_name,
      customer.phone,
      customer.email,
    ];

    return fieldsToSearch.some((field) =>
      String(field || "")
        .toLowerCase()
        .includes(lowerQuery),
    );
  });
}
