import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { partsData } from '@/lib/parts-data-seed';

export async function GET() {
  try {
    console.log("Starting Supabase database seeding...");

    // 1. Seed Brands
    const uniqueBrandNames = Array.from(
      new Set(partsData.map((p) => p.brand).filter(Boolean))
    ) as string[];

    const brandsToInsert = uniqueBrandNames.map((name) => ({
      name,
    }));

    const { data: brandsResult, error: brandsError } = await supabaseAdmin
      .from('brands')
      .upsert(brandsToInsert, { onConflict: 'name' })
      .select();

    if (brandsError) {
      console.error('Error seeding brands:', brandsError);
      return NextResponse.json({ error: 'Failed to seed brands.', details: brandsError.message }, { status: 500 });
    }

    // Create a mapping of brand name -> brand UUID
    const brandMap = new Map<string, string>();
    brandsResult?.forEach((b) => {
      brandMap.set(b.name, b.id);
    });

    // 2. Seed Categories
    // We have parent mainCategory (type: main) and subcategory (type: sub)
    const mainCategories = Array.from(
      new Set(partsData.map((p) => p.mainCategory).filter(Boolean))
    ) as string[];

    const mainCategoriesToInsert = mainCategories.map((name) => ({
      name,
      type: 'main',
    }));

    const { data: mainCatsResult, error: mainCatsError } = await supabaseAdmin
      .from('categories')
      .upsert(mainCategoriesToInsert, { onConflict: 'name' })
      .select();

    if (mainCatsError) {
      console.error('Error seeding main categories:', mainCatsError);
      return NextResponse.json({ error: 'Failed to seed main categories.', details: mainCatsError.message }, { status: 500 });
    }

    const categoryMap = new Map<string, string>();
    mainCatsResult?.forEach((c) => {
      categoryMap.set(c.name, c.id);
    });

    // Now insert subcategories (type: sub, parentId: mainCategory UUID)
    const subcategoryMap = new Map<string, { name: string; mainCategory: string }>();
    partsData.forEach((p) => {
      if (p.subcategory && p.mainCategory) {
        subcategoryMap.set(p.subcategory, {
          name: p.subcategory,
          mainCategory: p.mainCategory,
        });
      }
    });

    const subcategoriesToInsert = Array.from(subcategoryMap.values()).map((sub) => {
      const parentId = categoryMap.get(sub.mainCategory) || null;
      return {
        name: sub.name,
        type: 'sub',
        parentId,
      };
    });

    const { data: subCatsResult, error: subCatsError } = await supabaseAdmin
      .from('categories')
      .upsert(subcategoriesToInsert, { onConflict: 'name' })
      .select();

    if (subCatsError) {
      console.error('Error seeding subcategories:', subCatsError);
      return NextResponse.json({ error: 'Failed to seed subcategories.', details: subCatsError.message }, { status: 500 });
    }

    subCatsResult?.forEach((c) => {
      categoryMap.set(c.name, c.id);
    });

    // 3. Seed Parts
    const partsToInsert = partsData.map((p) => {
      const brandId = p.brand ? brandMap.get(p.brand) || null : null;
      const categoryId = p.subcategory ? categoryMap.get(p.subcategory) || null : null;

      return {
        sku: p.id, // Original custom string ID as SKU
        name: p.name,
        name_hi: p.name_hi || null,
        mainCategory: p.mainCategory,
        subcategory: p.subcategory,
        price: p.price,
        discountPrice: p.discountPrice !== undefined ? p.discountPrice : null,
        description: p.description,
        description_hi: p.description_hi || null,
        image: p.image,
        imageFileId: p.imageFileId || null,
        features: p.features,
        features_hi: p.features_hi || null,
        minQuantity: p.minQuantity !== undefined ? p.minQuantity : 1,
        brand: p.brand || null,
        brandId,
        gpd: p.gpd !== undefined ? p.gpd : null,
        voltage: p.voltage || null,
        inletOutletSize: p.inletOutletSize || null,
        material: p.material || null,
        color: p.color || null,
        stock: 50, // default stock
      };
    });

    const { error: partsError } = await supabaseAdmin
      .from('parts')
      .upsert(partsToInsert, { onConflict: 'sku' });

    if (partsError) {
      console.error('Error seeding parts:', partsError);
      return NextResponse.json({ error: 'Failed to seed parts.', details: partsError.message }, { status: 500 });
    }

    // 4. Seed Banners
    const defaultBanner = {
      title: '30% Off Premium RO Membranes!',
      title_hi: 'प्रीमियम आरओ मेम्ब्रेन पर 30% की छूट!',
      subtitle: 'Upgrade your system for purer water. Long-lasting, efficient, and reliable performance.',
      subtitle_hi: 'शुद्ध पानी के लिए अपने सिस्टम को अपग्रेड करें। लंबे समय तक चलने वाला, कुशल और विश्वसनीय प्रदर्शन।',
      badge: 'Limited Time Offer',
      badge_hi: 'सीमित समय की पेशकश',
      image: '/ro-membrane-banner.png',
      active: true,
      order: 0,
    };

    const { error: bannerError } = await supabaseAdmin
      .from('banners')
      .upsert([defaultBanner], { onConflict: 'title' });

    if (bannerError) {
      console.warn('Warning: Failed to seed default banner:', bannerError.message);
    }

    // 5. Seed QA Test Accounts
    const qaUsers = [
      {
        email: 'retail@test.com',
        password: 'test1234',
        profile: {
          role: 'retail',
          verification_status: 'pending'
        }
      },
      {
        email: 'business@test.com',
        password: 'test1234',
        profile: {
          role: 'business',
          verification_status: 'approved',
          company_name: 'Test Business Ltd',
          gst_number: '07AAAAA1111A1Z1',
          phone_number: '9876543210',
          business_type_code: 'wholesaler',
          city: 'Delhi',
          state: 'Delhi'
        }
      }
    ];

    for (const qaUser of qaUsers) {
      let userId: string | undefined;
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: qaUser.email,
        password: qaUser.password,
        email_confirm: true
      });

      if (createError) {
        // Find existing user ID
        const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
        const existing = existingUsers?.users.find(u => u.email === qaUser.email);
        userId = existing?.id;
      } else {
        userId = newUser.user?.id;
      }

      if (userId) {
        const { error: profileError } = await supabaseAdmin
          .from('profiles')
          .upsert({
            id: userId,
            email: qaUser.email,
            ...qaUser.profile
          }, { onConflict: 'id' });

        if (profileError) {
          console.error(`Error seeding QA profile for ${qaUser.email}:`, profileError.message);
        }
      }
    }

    return NextResponse.json({
      message: `Successfully seeded database: ${brandsToInsert.length} brands, ${mainCategoriesToInsert.length + subcategoriesToInsert.length} categories, ${partsToInsert.length} parts, and QA test accounts seeded/updated.`,
    }, { status: 200 });

  } catch (error: any) {
    console.error('Seeding process failed:', error);
    return NextResponse.json({ error: 'Exception occurred during seeding.', details: error.message }, { status: 500 });
  }
}
